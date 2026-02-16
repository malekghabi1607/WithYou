/**
 * Projet : WithYou
 * Fichier : pages/RoomPage.tsx
 *
 * Description :
 * Page principale du salon de visionnage collaboratif.
 * Interface complète pour regarder des vidéos ensemble en temps réel.
 * Gère :
 *  - Le lecteur vidéo YouTube avec synchronisation
 *  - Le chat en direct avec réactions et émojis
 *  - La liste des participants avec statuts en ligne/hors-ligne
 *  - La playlist vidéo avec votes et favoris
 *  - Les contrôles admin (ajouter/supprimer vidéos, gérer permissions)
 *  - Les panneaux d'informations et de notation
 *  - La persistance des données (messages, playlist) via backend
 *  - Les modes clair et sombre
 *
 * Utilisé dans routes/AppRouter.tsx via RoomPageWrapper.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Logo } from "../components/ui/Logo";
import { PollSection } from "../components/room/PollSection";
import {
  Play,
  Pause,
  RotateCcw,
  LogOut,
  Heart,
  MessageCircle,
  Users,
  Plus,
  Send,
  Menu,
  Crown,
  Sun,
  Moon,
  Info,
  ThumbsUp,
  BarChart3,
  Shield,
  History,
  Share2
} from "lucide-react";
import { LeaveRoomDialog } from "./LeaveRoomDialog";
import { RoomInfoPanel } from "../components/room/RoomInfoPanel";
import { RoomRatingPanel } from "../components/room/RoomRatingPanel";
import { VideoVotePanel } from "../components/room/VideoVotePanel";
import { ParticipantsPermissionsPanel } from "../components/room/ParticipantsPermissionsPanel";
import { VideoManagementPanel } from "../components/room/VideoManagementPanel";
import { VideoHistoryPanel } from "../components/room/VideoHistoryPanel";
import { ShareRoomDialog } from "../components/room/ShareRoomDialog";
import { YouTubePlayer } from "../components/room/YouTubePlayer";
import { EmptyState } from "../components/room/EmptyStates";
import { toast } from "sonner";
import { addVideoToPlaylist, fetchPlaylist, fetchPlaylistById, removeVideoFromPlaylist, fetchSalonByCode } from "../api/rooms";
import { fetchFavorites, addFavorite, removeFavorite } from "../api/favorites";
import { fetchParticipants, connectToSalon, disconnectFromSalon } from "../api/participants";
import { supabase } from "../api/supabase";

const THUMBNAIL_MOVIE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 225' fill='none'%3E%3Crect width='400' height='225' fill='%231F2937'/%3E%3Crect x='30' y='40' width='340' height='145' rx='8' fill='%23374151'/%3E%3Cpath d='M160 100 L160 170 L220 135 Z' fill='%23DC2626'/%3E%3C/svg%3E";

const createAvatarDataUrl = (name: string) => {
  const initial = (name || "U").trim().charAt(0).toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='%23DC2626'/><text x='32' y='40' font-size='28' text-anchor='middle' fill='white' font-family='Arial, sans-serif'>${initial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

interface Participant {
  id: string;
  name: string;
  role: "admin" | "member";
  status: "online" | "offline";
  avatar: string;
}

interface Message {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: string;
  isYou: boolean;
  reactions?: { emoji: string; count: number; userIds: string[] }[];
}

interface VideoInPlaylist {
  id: string;
  youtubeId?: string;
  title: string;
  thumbnail: string;
  duration: string;
  isCurrent?: boolean;
  votes?: number;
  isFavorite?: boolean;
}

interface VideoHistoryEntry {
  id: string;
  youtubeId?: string;
  title: string;
  thumbnail: string;
  duration: string;
  playedAt: string;
  playedBy: string;
}

interface RoomPageProps {
  roomId: string;
  roomName?: string;
  roomCreator?: string;
  currentUser: { email: string; name: string; id: string };
  onNavigate: (page: string, data?: any) => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

const reactions = ["❤️", "😂", "👍", "🔥", "😮", "🎉"];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getErrorMessage = (error: any, fallback: string) => {
  const message =
    error?.message ||
    error?.error_description ||
    error?.details ||
    error?.hint ||
    fallback;
  return message === fallback ? fallback : `${fallback}: ${message}`;
};

export function RoomPage({ roomId, roomName, roomCreator, currentUser, onNavigate, theme = "dark", onThemeToggle }: RoomPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [syncNonce, setSyncNonce] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "participants" | "polls">("chat");
  const [backendSalonId, setBackendSalonId] = useState<string>("");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [playlist, setPlaylist] = useState<VideoInPlaylist[]>([]);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [videoHistory, setVideoHistory] = useState<VideoHistoryEntry[]>([]);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showVideoVote, setShowVideoVote] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showVideoManagement, setShowVideoManagement] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [roomCode, setRoomCode] = useState<string>("");
  const [role, setRole] = useState<"admin" | "teacher" | "student" | "guest" | "member" | null>(null);
  const [videoVoteCounts, setVideoVoteCounts] = useState<Record<string, number>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);
  const roomChannelRef = useRef<any>(null);
  const historyLoadedRef = useRef(false);
  const lastTrackedVideoIdRef = useRef<string | null>(null);

  const isAdmin = role === "admin";
  const voteStorageKey = `room_${roomId}_videoVotes`;

  const withFallback = async <T,>(
    primaryId: string | null,
    fallbackId: string,
    fetcher: (id: string) => Promise<T>
  ): Promise<T> => {
    if (primaryId) {
      try {
        return await fetcher(primaryId);
      } catch {
        if (primaryId === fallbackId) throw new Error("primary equals fallback");
      }
    }
    return await fetcher(fallbackId);
  };

  const sendWithFallback = async <T,>(
    primaryId: string | null,
    fallbackId: string,
    sender: (id: string) => Promise<T>
  ): Promise<T> => {
    if (primaryId) {
      try {
        return await sender(primaryId);
      } catch {
        if (primaryId === fallbackId) throw new Error("primary equals fallback");
      }
    }
    return await sender(fallbackId);
  };

  // Filtrer les participants pour éviter que l'admin soit dans la liste
  const otherParticipants = participants.filter(p =>
    p.id !== currentUser.id &&
    p.id !== currentUser.email &&
    p.name !== currentUser.name
  );

  const participantCount = otherParticipants.filter(p => p.status === "online").length + 1; // +1 pour l'utilisateur courant
  const currentVideo = playlist.find(v => v.isCurrent);

  const loadParticipantsSnapshot = useCallback(async () => {
    const data = await withFallback(backendSalonId, roomId, fetchParticipants);
    if (role === null) {
      const current = (data || []).find((participant: any) =>
        participant?.id === currentUser.id || participant?.email === currentUser.email
      );
      if (current?.role) {
        setRole(current.role === "admin" ? "admin" : "member");
      }
    }
    const mapped = (data || []).map((participant: any) => ({
      id: participant.id,
      name: participant.name ?? "Utilisateur",
      role: (participant.role || "member") as "admin" | "teacher" | "student" | "guest" | "member",
      status: (participant.is_active ? "online" : "offline") as "online" | "offline",
      avatar: createAvatarDataUrl(participant.name ?? "Utilisateur"),
    }));
    setParticipants(mapped);
  }, [backendSalonId, roomId, role, currentUser.id, currentUser.email]);

  const loadRoomSnapshot = useCallback(async () => {
    if (!backendSalonId) return;

    // Load Messages
    const { data: messagesData, error: msgError } = await supabase
      .from('messages')
      .select('*, user:users(username, email, id_user)')
      .eq('salon_id', backendSalonId)
      .order('sent_at', { ascending: true });

    if (!msgError) {
      const mappedMessages = (messagesData || []).map((msg: any) => ({
        id: msg.id_message,
        sender: msg.user?.username || "Inconnu",
        senderId: msg.user_id,
        content: msg.content,
        timestamp: new Date(msg.sent_at).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isYou: msg.user?.email === currentUser.email,
        reactions: [],
      }));
      setMessages(mappedMessages);
    }

    // Load salon + current video
    const { data: salonData } = await supabase
      .from('salon')
      .select('current_video_id, id_playlist, video(*), video_time, video_status')
      .eq('id_salon', backendSalonId)
      .single();

    const dbTime = Number(salonData?.video_time || 0);
    setCurrentTime(dbTime);
    setIsPlaying(salonData?.video_status === "playing");
    setSyncNonce(Date.now());

    // Load playlist
    const playlistData = salonData?.id_playlist
      ? await fetchPlaylistById(salonData.id_playlist)
      : await fetchPlaylist(backendSalonId);

    setPlaylistId(playlistData.playlistId);
    const mapped = (playlistData.items || []).map((item: any, index: number) => {
      const youtubeId = item.youtube_id;
      const isCurrent = salonData?.current_video_id
        ? item.id === salonData.current_video_id
        : index === 0;

      return {
        id: item.id,
        youtubeId,
        title: item.titre ?? "Sans titre",
        thumbnail: youtubeId
          ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
          : THUMBNAIL_MOVIE,
        duration: item.duration ? String(item.duration) : "0:00",
        isCurrent,
        votes: videoVoteCounts[item.id] ?? 0,
        isFavorite: youtubeId ? favoriteIds.has(youtubeId) : false,
      };
    });
    setPlaylist(mapped);
  }, [backendSalonId, currentUser.email, favoriteIds, videoVoteCounts]);

  useEffect(() => {
    setRoomCode(roomId);
    // Fast path: if route already contains salon UUID, use it immediately.
    if (UUID_REGEX.test(roomId)) {
      setBackendSalonId(roomId);
    }
  }, [roomId]);

  useEffect(() => {
    if (!backendSalonId) return;
    const connect = async () => {
      try {
        await connectToSalon(backendSalonId);
      } catch (error) {
        console.error("Erreur connexion salon", error);
      }
    };

    connect();

    return () => {
      disconnectFromSalon(backendSalonId).catch((error) => {
        console.error("Erreur déconnexion salon", error);
      });
    };
  }, [backendSalonId]);

  useEffect(() => {
    if (!roomCode) return;
    const fetchSalonId = async () => {
      try {
        const data = await fetchSalonByCode(roomCode);
        setBackendSalonId(data.id_salon || data.id || roomCode);
        // Always expose a shareable join code in the UI dialog.
        setRoomCode(data.invitation_code || data.room_code || data.id_salon || roomCode);
        if (data.owner_id) {
          setRole(currentUser.id === data.owner_id ? "admin" : "member");
        }
      } catch (error) {
        console.error("Erreur ID salon", error);
      }
    };
    fetchSalonId();
  }, [roomCode, currentUser.id]);

  useEffect(() => {
    if (role !== null) return;
    if (roomCreator && currentUser.email === roomCreator) {
      setRole("admin");
    }
  }, [roomCreator, currentUser.email, role]);

  useEffect(() => {
    let isMounted = true;
    const loadParticipants = async () => {
      try {
        if (!isMounted) return;
        await loadParticipantsSnapshot();
      } catch (error) {
        console.error("Erreur chargement participants", error);
      }
    };

    loadParticipants();
    const interval = window.setInterval(loadParticipants, 15000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [loadParticipantsSnapshot]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const data = await fetchFavorites();
        const ids = new Set((data || []).map((fav: any) => fav.youtube_id));
        setFavoriteIds(ids);
      } catch (error) {
        console.error("Erreur chargement favoris", error);
      }
    };

    loadFavorites();
  }, [currentUser.id]);

  useEffect(() => {
    if (!backendSalonId) return;

    loadRoomSnapshot().catch((error) => {
      console.error("Erreur chargement initial", error);
    });

    // 3. Realtime Subscription (Messages AND Salon Updates)
    const channel = supabase
      .channel(`room-${backendSalonId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `salon_id=eq.${backendSalonId}` },
        async (payload) => {
          // ... existing message logic ...
          const newMsg = payload.new;
          const { data: userData } = await supabase.from('users').select('username, email').eq('id_user', newMsg.user_id).single();
          const mapped: Message = {
            id: newMsg.id_message,
            sender: userData?.username || "...",
            senderId: newMsg.user_id,
            content: newMsg.content,
            timestamp: new Date(newMsg.sent_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            isYou: userData?.email === currentUser.email,
            reactions: [],
          };
          setMessages(prev => {
            if (prev.some(m => m.id === mapped.id)) return prev;
            return [...prev, mapped];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'salon', filter: `id_salon=eq.${backendSalonId}` },
        async (payload) => {
          const newSalonState = payload.new;
          if (newSalonState.current_video_id) {
            // Fetch video details if changed
            const { data: vid } = await supabase.from('video').select('*').eq('id_video', newSalonState.current_video_id).single();
            if (vid) {
              // Update playlist state to show this as current
              setPlaylist(prev => prev.map(p => ({
                ...p,
                isCurrent: p.id === vid.id_video
              })));
              // If it wasn't in playlist, maybe add it? 
              toast.info(`Vidéo changée: ${vid.title ?? vid.titre ?? "Sans titre"}`);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'salon_member', filter: `salon_id=eq.${backendSalonId}` },
        async () => {
          await loadParticipantsSnapshot();
        }
      )
      .on(
        'broadcast',
        { event: 'room_force_sync' },
        async (payload) => {
          if (payload?.payload?.by === currentUser.id) return;
          await loadRoomSnapshot();
          toast.info("Synchronisation reçue");
        }
      )
      .subscribe();

    roomChannelRef.current = channel;

    return () => {
      roomChannelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [roomId, backendSalonId, currentUser.id, loadRoomSnapshot, loadParticipantsSnapshot]);

  // Keep favorite flags in sync without blocking initial playlist load.
  useEffect(() => {
    setPlaylist((prev) =>
      prev.map((video) => ({
        ...video,
        isFavorite: video.youtubeId ? favoriteIds.has(video.youtubeId) : false,
      }))
    );
  }, [favoriteIds]);


  // Sauvegarder l'historique des vidéos
  useEffect(() => {
    historyLoadedRef.current = false;
    try {
      const raw = localStorage.getItem(`room_${roomId}_videoHistory`);
      if (!raw) {
        // Do not force-reset here: user may click a video before this effect completes.
        historyLoadedRef.current = true;
        return;
      }

      const parsed = JSON.parse(raw);
      const normalized = Array.isArray(parsed)
        ? parsed.filter((entry: any) =>
          entry &&
          typeof entry.id === "string" &&
          typeof entry.title === "string"
        )
        : [];

      setVideoHistory((prev) => {
        if (prev.length === 0) return normalized;
        const merged = [...prev, ...normalized];
        const seen = new Set<string>();
        const unique: VideoHistoryEntry[] = [];
        for (const entry of merged) {
          const key = `${entry.youtubeId || "no-id"}|${entry.playedAt}|${entry.title}`;
          if (seen.has(key)) continue;
          seen.add(key);
          unique.push(entry);
        }
        return unique.slice(0, 200);
      });
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      setVideoHistory([]);
    } finally {
      historyLoadedRef.current = true;
    }
  }, [roomId]);

  useEffect(() => {
    if (!historyLoadedRef.current) return;
    try {
      localStorage.setItem(`room_${roomId}_videoHistory`, JSON.stringify(videoHistory));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique:', error);
    }
  }, [roomId, videoHistory]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(voteStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === "object") {
        setVideoVoteCounts(parsed as Record<string, number>);
      } else {
        setVideoVoteCounts({});
      }
    } catch (error) {
      console.error("Erreur chargement votes vidéo:", error);
      setVideoVoteCounts({});
    }
  }, [voteStorageKey]);

  useEffect(() => {
    setPlaylist((prev) =>
      prev.map((video) => ({
        ...video,
        votes: videoVoteCounts[video.id] ?? video.votes ?? 0,
      }))
    );
  }, [videoVoteCounts]);

  // Track current video changes in history (works even with a single-video playlist).
  useEffect(() => {
    if (!currentVideo?.id) return;
    if (lastTrackedVideoIdRef.current === currentVideo.id) return;

    const historyEntry: VideoHistoryEntry = {
      id: Date.now().toString(),
      youtubeId: currentVideo.youtubeId,
      title: currentVideo.title,
      thumbnail: currentVideo.thumbnail,
      duration: currentVideo.duration,
      playedAt: new Date().toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      playedBy: currentUser.name
    };

    setVideoHistory((prev) => {
      if (prev[0]?.youtubeId && prev[0].youtubeId === historyEntry.youtubeId) {
        return prev;
      }
      return [historyEntry, ...prev].slice(0, 200);
    });

    lastTrackedVideoIdRef.current = currentVideo.id;
  }, [currentVideo?.id, currentVideo?.youtubeId, currentUser.name, currentVideo?.title, currentVideo?.thumbnail, currentVideo?.duration]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !backendSalonId) return;

    try {
      // Direct Insert to Supabase
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            salon_id: backendSalonId,
            user_id: currentUser.id, // Assuming currentUser.id is the UUID from users table
            content: newMessage.trim(),
            // sent_at is default now()
          }
        ]);

      if (error) throw error;

      // We don't need to manually update state here because the Realtime subscription
      // will pick up the new message (INSERT event) and add it to the list.
      // But we clear the input immediately.
      setNewMessage("");

    } catch (error: any) {
      toast.error(getErrorMessage(error, "Erreur envoi message"));
      console.error(error);
    }
  };

  const handleReactionClick = (emoji: string) => {
    const reactionMsg: Message = {
      id: Date.now().toString(),
      sender: "Vous",
      senderId: "current",
      content: emoji,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      isYou: true,
      reactions: []
    };

    setMessages([...messages, reactionMsg]);
  };

  const handleMessageReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);

        if (existingReaction) {
          if (existingReaction.userIds.includes("current")) {
            return {
              ...msg,
              reactions: reactions.map(r =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, userIds: r.userIds.filter(id => id !== "current") }
                  : r
              ).filter(r => r.count > 0)
            };
          } else {
            return {
              ...msg,
              reactions: reactions.map(r =>
                r.emoji === emoji
                  ? { ...r, count: r.count + 1, userIds: [...r.userIds, "current"] }
                  : r
              )
            };
          }
        } else {
          return {
            ...msg,
            reactions: [...reactions, { emoji, count: 1, userIds: ["current"] }]
          };
        }
      }
      return msg;
    }));
  };

  const handlePlayPause = async () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    if (backendSalonId) {
      try {
        await supabase.from('salon').update({
          video_status: newPlayingState ? 'playing' : 'paused',
          video_time: currentTime
        }).eq('id_salon', backendSalonId);

        if (roomChannelRef.current) {
          await roomChannelRef.current.send({
            type: 'broadcast',
            event: 'room_force_sync',
            payload: {
              by: currentUser.id,
              at: Date.now(),
              isPlaying: newPlayingState,
              time: currentTime
            }
          });
        }

      } catch (err) {
        console.error('Erreur sync video:', err);
      }
    }

    toast.success(
      newPlayingState
        ? `${currentUser.name} a lancé la vidéo`
        : `${currentUser.name} a mis en pause`,
      { icon: newPlayingState ? '▶️' : '⏸️' }
    );
  };

  const handleToggleFavorite = async (videoId: string) => {
    const target = playlist.find((video) => video.id === videoId);
    if (!target?.youtubeId) {
      return;
    }

    const youtubeId = target.youtubeId;
    const isCurrentlyFavorite = favoriteIds.has(youtubeId);

    try {
      if (isCurrentlyFavorite) {
        await removeFavorite(youtubeId);
      } else {
        await addFavorite({ youtubeId, title: target.title });
      }

      const nextFavorites = new Set(favoriteIds);
      if (isCurrentlyFavorite) {
        nextFavorites.delete(youtubeId);
      } else {
        nextFavorites.add(youtubeId);
      }
      setFavoriteIds(nextFavorites);
      setPlaylist((prev) =>
        prev.map((video) =>
          video.id === videoId ? { ...video, isFavorite: !isCurrentlyFavorite } : video
        )
      );
    } catch (error) {
      console.error("Erreur favoris", error);
      toast.error(getErrorMessage(error, "Impossible de mettre a jour le favori"));
    }
  };

  const handleLeaveRoom = () => {
    setShowLeaveDialog(true);
  };

  const confirmLeave = () => {
    setShowLeaveDialog(false);
    // Rediriger vers la page "salons" (liste des salons)
    onNavigate("salons");
  };

  const cancelLeave = () => {
    setShowLeaveDialog(false);
  };

  const handleSync = async () => {
    if (!isAdmin) {
      toast.error("Seul l'admin peut synchroniser");
      return;
    }
    if (!backendSalonId) {
      toast.error("Salon introuvable pour la synchronisation");
      return;
    }

    try {
      await supabase.from('salon').update({
        video_time: currentTime,
        video_status: isPlaying ? 'playing' : 'paused',
        current_video_id: currentVideo?.id || null
      }).eq('id_salon', backendSalonId);

      await loadRoomSnapshot();
      if (roomChannelRef.current) {
        await roomChannelRef.current.send({
          type: 'broadcast',
          event: 'room_force_sync',
          payload: {
            by: currentUser.id,
            at: Date.now(),
            time: currentTime,
            isPlaying
          }
        });
      }
      toast.success("Synchronisation envoyée à tous les invités");
    } catch (error: any) {
      toast.error(error?.message || "Erreur synchronisation");
      console.error("Erreur sync salon", error);
    }
  };

  const handleAddVideo = async (url: string, title: string) => {
    try {
      const existingCurrentId = playlist.find(v => v.isCurrent)?.id;
      const targetId = backendSalonId || roomId;
      await addVideoToPlaylist(targetId, { title, url });
      const data = await fetchPlaylist(targetId);
      setPlaylistId(data.playlistId);
      const mapped = (data.items || []).map((item: any, index: number) => {
        const youtubeId = item.youtube_id;
        return {
          id: item.id,
          youtubeId,
          title: item.titre ?? "Sans titre",
          thumbnail: youtubeId
            ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
            : THUMBNAIL_MOVIE,
          duration: item.duration ? String(item.duration) : "0:00",
          isCurrent: existingCurrentId ? item.id === existingCurrentId : index === 0,
          votes: videoVoteCounts[item.id] ?? 0,
          isFavorite: youtubeId ? favoriteIds.has(youtubeId) : false,
        };
      });
      setPlaylist(mapped);
      toast.success(`✅ Vidéo "${title}" ajoutée à la playlist !`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur ajout vidéo"));
      console.error(error);
    }
  };

  const handleRemoveVideo = async (videoId: string) => {
    const videoToRemove = playlist.find(v => v.id === videoId);
    try {
      const targetId = backendSalonId || roomId;
      await removeVideoFromPlaylist(targetId, videoId);
      setPlaylist(prev => prev.filter(v => v.id !== videoId));
      if (videoToRemove) {
        toast.success(`🗑️ Vidéo "${videoToRemove.title}" supprimée`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur suppression vidéo"));
      console.error(error);
    }
  };

  const handleUpdatePermissions = (updatedParticipants: Participant[]) => {
    setParticipants(updatedParticipants);
  };

  const handleVoteVideo = (videoId: string) => {
    const next = {
      ...videoVoteCounts,
      [videoId]: (videoVoteCounts[videoId] || 0) + 1,
    };
    setVideoVoteCounts(next);
    try {
      localStorage.setItem(voteStorageKey, JSON.stringify(next));
    } catch (error) {
      console.error("Erreur sauvegarde votes vidéo:", error);
    }
  };

  const handlePlayVideo = async (video: VideoInPlaylist) => {
    try {
      if (!video?.id) return;

      toast.success(`Lecture de "${video.title}"`, {
        duration: 3000,
        icon: '🎬',
        description: `Lancée par ${currentUser.name}`,
      });

      // Basculer immédiatement côté UI
      setPlaylist(prev => prev.map(v =>
        v.id === video.id ? { ...v, isCurrent: true } : { ...v, isCurrent: false }
      ));
      setCurrentTime(0);
      setIsPlaying(true);
      setSyncNonce(Date.now());

      // Seul l'admin persiste/synchronise l'état global du salon
      if (isAdmin && backendSalonId) {
        if (roomChannelRef.current) {
          try {
            await roomChannelRef.current.send({
              type: 'broadcast',
              event: 'room_force_sync',
              payload: {
                by: currentUser.id,
                at: Date.now(),
                videoId: video.id,
                isPlaying: true,
                time: 0,
              }
            });
          } catch (broadcastError) {
            console.warn("Broadcast error", broadcastError);
          }
        }

        const { error: updateError } = await supabase
          .from('salon')
          .update({
            current_video_id: video.id,
            video_status: 'playing',
            video_time: 0
          })
          .eq('id_salon', backendSalonId);

        if (updateError) {
          console.error("Error updating salon video state", updateError);
        }
      }

    } catch (error) {
      console.error("Erreur changement vidéo", error);
      toast.error("Impossible de changer la vidéo");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      {/* Header Fixed - ne scroll pas */}
      <header className={`sticky top-0 z-30 ${theme === 'dark' ? 'bg-black border-zinc-800' : 'bg-white border-gray-200'} border-b px-6 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-6">
          <Logo size="sm" theme={theme} showText={true} />

          <div className="flex items-center gap-3">
            <h1 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-base font-semibold`}>
              {roomName}
            </h1>

            <div className="flex items-center gap-2">
              <Users className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                {participantCount}
              </span>
            </div>

            <Badge className="bg-red-600 text-white hover:bg-red-600 px-3 py-1 flex items-center gap-1.5">
              <Crown className="w-3 h-3" />
              {role === null ? "..." : isAdmin ? "Admin" : "Invité"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowVideoManagement(true);
              }}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs"
            >
              <Plus className="w-3 h-3 mr-1.5" />
              Ajouter
            </Button>
          )}

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePlayPause();
            }}
            variant="ghost"
            size="sm"
            className={`${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-zinc-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'} text-sm h-9`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-1.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1.5" />
                Lecture
              </>
            )}
          </Button>

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSync();
            }}
            variant="ghost"
            size="sm"
            className={`${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-zinc-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'} text-sm h-9`}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Sync
          </Button>

          {onThemeToggle && (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onThemeToggle();
              }}
              variant="ghost"
              size="sm"
              className={`${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-zinc-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'} h-9 px-3`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          )}

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowLeaveDialog(true);
            }}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-100/10 text-sm h-9"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Quitter
          </Button>
        </div>
      </header>

      {/* Main Content - SCROLL GLOBAL sur toute la page */}
      <div className="flex gap-4 p-4">
        {/* LEFT: Video + Playlist - 2/3 de l'écran */}
        <div className="flex-1 space-y-6">
          {/* Video Player */}
          {currentVideo && currentVideo.youtubeId ? (
            <YouTubePlayer
              videoId={currentVideo.youtubeId}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              syncTime={currentTime}
              syncNonce={syncNonce}
              onTimeUpdate={(seconds) => {
                if (isAdmin) setCurrentTime(seconds);
              }}
              onPlaybackStateChange={(playing) => {
                if (isAdmin) setIsPlaying(playing);
              }}
              theme={theme}
            />
          ) : (
            <div className={`relative ${theme === 'dark' ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-200 to-gray-300'} rounded-xl overflow-hidden aspect-video flex items-center justify-center`}>
              <Badge className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1">
                En direct
              </Badge>

              <button
                onClick={handlePlayPause}
                className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-white/80" />
                ) : (
                  <Play className="w-10 h-10 text-white/80 ml-1" />
                )}
              </button>
            </div>
          )}

          {/* Playlist Section - PAS DE SCROLL INTERNE, grille compacte 4 colonnes */}
          <div className={`${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-sm font-semibold flex items-center gap-2`}>
                <Menu className="w-4 h-4" />
                PLAYLIST ({playlist.length})
              </h2>
            </div>

            {playlist.length === 0 ? (
              <EmptyState type="videos" theme={theme} />
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {playlist.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => {
                      handlePlayVideo(video);
                    }}
                    className={`relative group rounded-lg overflow-hidden ${video.isCurrent ? "ring-2 ring-red-600" : ""
                      } cursor-pointer hover:ring-2 hover:ring-red-400 transition-all`}
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                    />

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>

                    {video.isCurrent && (
                      <div className="absolute top-1.5 left-1.5 bg-red-600 rounded px-1.5 py-0.5 flex items-center gap-1">
                        <Play className="w-2 h-2 text-white fill-white" />
                        <span className="text-white text-[10px] font-medium">EN COURS</span>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(video.id);
                      }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <Heart className={`w-3 h-3 ${video.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                      <p className="text-white text-[11px] truncate leading-tight">{video.title}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">{video.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Chat + Participants - 1/3 de l'écran, hauteur fixe */}
        <div className={`w-80 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'} rounded-xl flex flex-col sticky top-20 h-[calc(100vh-6rem)]`}>
          <div className={`flex border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-300'}`}>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 px-4 py-3 text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === "chat"
                ? "bg-red-600 text-white"
                : theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`flex-1 px-4 py-3 text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === "participants"
                ? "bg-red-600 text-white"
                : theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                }`}
            >
              <Users className="w-4 h-4" />
              Participants ({participantCount})
            </button><button
              onClick={() => setActiveTab("polls")}
              className={`flex-1 px-4 py-3 text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === "polls"
                ? "bg-red-600 text-white"
                : theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                }`}
            >
              <BarChart3 className="w-4 h-4" />
              Sondages
            </button>
          </div>

          {activeTab === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
                {messages.length === 0 ? (
                  <EmptyState type="messages" theme={theme} />
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="space-y-1 group">
                      <div
                        className={`${message.isYou
                          ? "bg-red-600 text-white rounded-2xl rounded-tr-sm"
                          : "bg-zinc-800 text-white rounded-2xl rounded-tl-sm"
                          } px-4 py-2 inline-block max-w-[85%] relative`}
                      >
                        <p className="text-sm">{message.content}</p>

                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {message.reactions.map((reaction, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleMessageReaction(message.id, reaction.emoji)}
                                className="text-xs bg-black/20 px-1.5 py-0.5 rounded-full flex items-center gap-1"
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-xs">{reaction.count}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 rounded-full px-2 py-1 flex gap-1 shadow-lg z-10">
                          {reactions.slice(0, 4).map((emoji, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleMessageReaction(message.id, emoji)}
                              className="hover:scale-125 transition-transform text-sm"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-gray-500">{message.timestamp}</span>
                        <span className="text-gray-400">{message.sender}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className={`px-4 py-2 border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-300'}`}>
                <div className="flex items-center gap-2 justify-between">
                  {reactions.map((reaction, index) => (
                    <button
                      key={index}
                      onClick={() => handleReactionClick(reaction)}
                      className="text-lg hover:scale-125 transition-transform"
                    >
                      {reaction}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-4 border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-300'}`}>
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    autoComplete="off"
                    placeholder="Message..."
                    className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-black placeholder:text-gray-400'} flex-1 text-sm h-9`}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-red-600 hover:bg-red-700 text-white h-9 px-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Menu flottant horizontal - SOUS le chat */}
              <div className="p-3 flex items-center justify-center gap-2">
                {/* Menu button - rouge - Ouvre le menu de TOUS les boutons */}
                <button
                  onClick={() => {
                    setShowMenu(!showMenu);
                  }}
                  className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg flex items-center justify-center transition-all hover:scale-105"
                  title="Menu principal"
                >
                  <Menu className="w-6 h-6 text-white" />
                </button>
              </div>
            </>
          )}

          {activeTab === "participants" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                <div className={`p-3 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'} rounded-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-sm flex items-center gap-2`}>
                          {currentUser.name} (Vous)
                          {isAdmin && <Crown className="w-3 h-3 text-yellow-500" />}
                        </p>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                          {role === null ? "..." : isAdmin ? "Administrateur" : "Invité"}
                        </p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                {otherParticipants
                  .map((participant) => (
                    <div key={participant.id} className={`p-3 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'} rounded-lg`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-sm flex items-center gap-2`}>
                              {participant.name}
                              {participant.role === "admin" && <Crown className="w-3 h-3 text-yellow-500" />}
                            </p>
                            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                              {participant.role === "admin" ? "Administrateur" : "Invité"}
                            </p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${participant.status === "online" ? "bg-green-500" : "bg-gray-500"
                          }`}></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {activeTab === "polls" && backendSalonId && (
            <div className="flex-1 overflow-hidden h-full">
              <PollSection
                salonId={backendSalonId}
                isAdmin={isAdmin}
                currentUser={currentUser.name}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu - popup au-dessus des boutons */}
      {showMenu && (
        <>
          {/* Overlay pour fermer le menu en cliquant en dehors */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowMenu(false)}
          ></div>

          {/* Menu contextuel */}
          <div className={`fixed bottom-24 right-6 w-64 flex flex-col gap-2 z-50 rounded-xl p-3 shadow-2xl ${theme === 'dark' ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-gray-300'}`}>
            <Button
              onClick={() => {
                setShowShareDialog(true);
                setShowMenu(false);
              }}
              variant="ghost"
              className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Inviter des amis
            </Button>

            <Button
              onClick={() => {
                setShowRoomInfo(true);
                setShowMenu(false);
              }}
              variant="ghost"
              className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
            >
              <Info className="w-4 h-4 mr-2" />
              Informations du salon
            </Button>

            <Button
              onClick={() => {
                setShowVideoVote(true);
                setShowMenu(false);
              }}
              variant="ghost"
              className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Voter pour une vidéo
            </Button>

            <Button
              onClick={() => {
                setShowRating(true);
                setShowMenu(false);
              }}
              variant="ghost"
              className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Noter le salon
            </Button>

            <Button
              onClick={() => {
                setShowHistory(true);
                setShowMenu(false);
              }}
              variant="ghost"
              className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
            >
              <History className="w-4 h-4 mr-2" />
              Historique des vidéos
            </Button>

            {isAdmin && (
              <>
                <div className={`border-t my-1 ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-300'}`}></div>

                <Button
                  onClick={() => {
                    setShowPermissions(true);
                    setShowMenu(false);
                  }}
                  variant="ghost"
                  className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Gérer les permissions
                </Button>

                <Button
                  onClick={() => {
                    setShowVideoManagement(true);
                    setShowMenu(false);
                  }}
                  variant="ghost"
                  className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Gérer les vidéos
                </Button>
              </>
            )}

            <div className={`border-t my-1 ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-300'}`}></div>

            <Button
              onClick={() => {
                setShowLeaveDialog(true);
                setShowMenu(false);
              }}
              variant="ghost"
              className="justify-start text-red-400 hover:bg-red-900/20 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Quitter le salon
            </Button>
          </div>
        </>
      )}

      {showLeaveDialog && (
        <LeaveRoomDialog
          onClose={() => setShowLeaveDialog(false)}
          onConfirm={confirmLeave}
          onCancel={cancelLeave}
          theme={theme}
        />
      )}

      {showRoomInfo && (
        <RoomInfoPanel
          roomId={roomId}
          adminName={
            participants.find((p) => p.role === "admin")?.name ||
            (isAdmin ? currentUser.name : undefined)
          }
          participantsCount={participantCount}
          onClose={() => setShowRoomInfo(false)}
          theme={theme}
        />
      )}

      {showRating && (
        <RoomRatingPanel
          roomId={roomId}
          onClose={() => setShowRating(false)}
          theme={theme}
        />
      )}

      {showVideoVote && (
        <VideoVotePanel
          videos={playlist.map(v => ({
            id: v.id,
            title: v.title,
            thumbnail: v.thumbnail,
            votes: v.votes || 0
          }))}
          onClose={() => setShowVideoVote(false)}
          onVote={handleVoteVideo}
          theme={theme}
        />
      )}

      {showPermissions && isAdmin && (
        <ParticipantsPermissionsPanel
          participants={[
            {
              id: `current-user-${currentUser.email}`,
              name: currentUser.name,
              role: isAdmin ? "admin" : "member",
              status: "online",
              avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23DC2626'/%3E%3Ccircle cx='100' cy='80' r='35' fill='white' opacity='0.9'/%3E%3Cellipse cx='100' cy='160' rx='55' ry='40' fill='white' opacity='0.9'/%3E%3C/svg%3E"
            },
            ...otherParticipants
          ]}
          onClose={() => setShowPermissions(false)}
          onUpdatePermissions={handleUpdatePermissions}
          theme={theme}
          isReadOnly={false}
        />
      )}

      {showVideoManagement && isAdmin && (
        <VideoManagementPanel
          videos={playlist}
          onClose={() => setShowVideoManagement(false)}
          onAddVideo={handleAddVideo}
          onRemoveVideo={handleRemoveVideo}
          theme={theme}
        />
      )}

      {showHistory && (
        <VideoHistoryPanel
          history={videoHistory}
          onClose={() => setShowHistory(false)}
          theme={theme}
        />
      )}

      {/* ShareRoomDialog temporairement désactivé pour debug */}
      {showShareDialog && roomCode && (
        <ShareRoomDialog
          isOpen={showShareDialog}
          roomCode={roomCode}
          roomName={roomName || 'Salon'}
          onClose={() => setShowShareDialog(false)}
          theme={theme}
        />
      )}
    </div>
  );
}
