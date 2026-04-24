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
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/Input";
import { Logo } from "../components/ui/Logo";
import { PollSection } from "../components/room/PollSection";
import {
  BookmarkPlus,
  Play,
  Pause,
  RotateCcw,
  LogOut,
  Heart,
  Clock3,
  Lock,
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
  Share2,
  Clapperboard,
  Megaphone,
  EyeOff
} from "lucide-react";
import { LeaveRoomDialog } from "./LeaveRoomDialog";
import { RoomInfoPanel } from "../components/room/RoomInfoPanel";
import { RoomRatingPanel } from "../components/room/RoomRatingPanel";
import { VideoVotePanel } from "../components/room/VideoVotePanel";
import { ParticipantsPermissionsPanel } from "../components/room/ParticipantsPermissionsPanel";
import { VideoManagementPanel } from "../components/room/VideoManagementPanel";
import { VideoHistoryPanel } from "../components/room/VideoHistoryPanel";
import { RegieActionHistoryPanel, type RegieActionEntry } from "../components/room/RegieActionHistoryPanel";
import { ShareRoomDialog } from "../components/room/ShareRoomDialog";
import { RegieAnnouncementDialog } from "../components/room/RegieAnnouncementDialog";
import { SessionLockPanel, type SessionLockState } from "../components/room/SessionLockPanel";
import { VideoBookmarkDialog } from "../components/room/VideoBookmarkDialog";
import { YouTubePlayer } from "../components/room/YouTubePlayer";
import { EmptyState } from "../components/room/EmptyStates";
import { toast } from "sonner";
import { createRegieHistoryEntry, fetchRegieHistory } from "../api/regieHistory";
import { createVideoBookmark, fetchVideoBookmarks } from "../api/videoBookmarks";
import { addVideoToPlaylist, addVideosToPlaylistBatch, fetchPlaylist, fetchPlaylistById, removeVideoFromPlaylist, fetchSalonByCode } from "../api/rooms";
import { fetchFavorites, addFavorite, removeFavorite } from "../api/favorites";
import { fetchParticipants, connectToSalon, disconnectFromSalon, setParticipantPermissions as setParticipantPermissionsApi, setParticipantRole, type MemberPermissions, type SalonRole } from "../api/participants";
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
  email?: string | null;
  role: SalonRole;
  status: "online" | "offline";
  avatar: string;
}

type PermissionsByParticipant = Record<string, MemberPermissions>;

const buildDefaultPermissions = (role: SalonRole | null): MemberPermissions => {
  if (role === "admin" || role === "regie") {
    return { chat: true, video: true, playlist: true, polls: true, pin: true, muted: false };
  }
  return { chat: true, video: false, playlist: false, polls: false, pin: false, muted: false };
};

const normalizePermissions = (
  role: SalonRole | null,
  partial?: Partial<MemberPermissions> | null
): MemberPermissions => ({
  ...buildDefaultPermissions(role),
  ...(partial || {}),
});

interface Message {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: string;
  isYou: boolean;
  reactions?: { emoji: string; count: number; userIds: string[] }[];
}

type MessageReactionEntry = { emoji: string; userIds: string[] };
type MessageReactionsById = Record<string, MessageReactionEntry[]>;

const mapDbMessageToUi = (
  msg: any,
  currentUser: { email: string; name: string; id: string }
): Message => {
  const senderId = msg.user_id || msg.id_user || msg.user_name || "unknown";
  const senderName = msg.user?.username || msg.user_name || "Inconnu";
  const id = msg.id || msg.id_message || `${senderId}-${msg.created_at || msg.sent_at || Date.now()}`;
  const rawDate = msg.sent_at || msg.created_at || Date.now();
  const isYouById = msg.user_id === currentUser.id || msg.id_user === currentUser.id;
  const isYouByName = msg.user_name && msg.user_name === currentUser.name;

  return {
    id,
    sender: senderName,
    senderId,
    content: msg.content,
    timestamp: new Date(rawDate).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isYou: Boolean(isYouById || isYouByName || msg.user?.email === currentUser.email),
    reactions: [],
  };
};

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

interface VideoBookmarkEntry {
  id: string;
  videoId: string;
  videoTitle: string;
  time: number;
  label: string;
  byName: string;
  createdAt: string;
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
const DEFAULT_SESSION_LOCK_STATE: SessionLockState = {
  roomLocked: false,
  chatDisabled: false,
  focusMode: false,
};

const formatVideoTimeLabel = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const createClientUuid = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

const mergeRegieHistoryEntries = (...lists: RegieActionEntry[][]) => {
  const seen = new Set<string>();
  const merged: RegieActionEntry[] = [];

  for (const list of lists) {
    for (const entry of list) {
      if (!entry?.id || seen.has(entry.id)) continue;
      seen.add(entry.id);
      merged.push(entry);
    }
  }

  return merged.slice(0, 100);
};

const mergeVideoBookmarkEntries = (...lists: VideoBookmarkEntry[][]) => {
  const seen = new Set<string>();
  const merged: VideoBookmarkEntry[] = [];

  for (const list of lists) {
    for (const entry of list) {
      if (!entry?.id || seen.has(entry.id)) continue;
      seen.add(entry.id);
      merged.push(entry);
    }
  }

  return merged.slice(0, 300);
};

const getErrorMessage = (error: any, fallback: string) => {
  const message =
    error?.message ||
    error?.error_description ||
    error?.details ||
    error?.hint ||
    fallback;
  return message === fallback ? fallback : `${fallback}: ${message}`;
};

const MESSAGE_ROOM_COLUMNS = ["salon_id", "id_salon", "room_id"] as const;
type MessageRoomColumn = (typeof MESSAGE_ROOM_COLUMNS)[number];
const SALON_ID_COLUMNS = ["id_salon", "id"] as const;
type SalonIdColumn = (typeof SALON_ID_COLUMNS)[number];
const MESSAGE_AUTHOR_COLUMNS = ["user_id", "id_user", "user_name"] as const;
type MessageAuthorColumn = (typeof MESSAGE_AUTHOR_COLUMNS)[number];

const hasMissingColumnError = (error: any, column: string) => {
  const blob = [
    error?.message,
    error?.details,
    error?.hint,
    error?.error_description,
  ]
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();

  return (
    blob.includes(`could not find the '${column}' column`) ||
    blob.includes(`could not find the "${column}" column`) ||
    blob.includes(`column "${column}" does not exist`) ||
    blob.includes(`column ${column} does not exist`) ||
    blob.includes(`unknown column '${column}'`) ||
    (blob.includes("schema cache") && blob.includes(column))
  );
};

const getNextMessageRoomColumn = (column: MessageRoomColumn): MessageRoomColumn => {
  const idx = MESSAGE_ROOM_COLUMNS.indexOf(column);
  return MESSAGE_ROOM_COLUMNS[(idx + 1) % MESSAGE_ROOM_COLUMNS.length];
};

const getMessageAuthorValue = (
  column: MessageAuthorColumn,
  currentUser: { id: string; name: string }
) => (column === "user_name" ? currentUser.name : currentUser.id);

const getRoleLabel = (role: SalonRole | null) => {
  if (role === "admin") return "Administrateur";
  if (role === "regie") return "Regie video";
  if (role === "member") return "Invite";
  return "...";
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
  const [participantPermissions, setParticipantPermissionsMap] = useState<PermissionsByParticipant>({});
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
  const [showRegieHistory, setShowRegieHistory] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [showSessionLockPanel, setShowSessionLockPanel] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [regieActionHistory, setRegieActionHistory] = useState<RegieActionEntry[]>([]);
  const [sessionLockState, setSessionLockState] = useState<SessionLockState>(DEFAULT_SESSION_LOCK_STATE);
  const [videoBookmarks, setVideoBookmarks] = useState<VideoBookmarkEntry[]>([]);
  const [roomCode, setRoomCode] = useState<string>("");
  const [role, setRole] = useState<SalonRole | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [videoVoteCounts, setVideoVoteCounts] = useState<Record<string, number>>({});
  const [messageSalonColumn, setMessageSalonColumn] = useState<MessageRoomColumn>("salon_id");
  const [messageUserColumn, setMessageUserColumn] = useState<MessageAuthorColumn>("user_id");
  const [salonIdColumn, setSalonIdColumn] = useState<SalonIdColumn>("id_salon");
  const [storedReactionsByMessage, setStoredReactionsByMessage] = useState<MessageReactionsById>({});

  const chatEndRef = useRef<HTMLDivElement>(null);
  const roomChannelRef = useRef<any>(null);
  const messageSalonColumnRef = useRef<MessageRoomColumn>("salon_id");
  const salonIdColumnRef = useRef<SalonIdColumn>("id_salon");
  const historyLoadedRef = useRef(false);
  const lastTrackedVideoIdRef = useRef<string | null>(null);
  const lastAdminPlayerTimeRef = useRef<number | null>(null);
  const lastSeekBroadcastAtRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const lastPlaybackPersistAtRef = useRef<number>(0);
  const lastPlaybackBroadcastStateRef = useRef<boolean | null>(null);
  const lastRealtimeSyncAtRef = useRef<number>(0);
  const lastViewerCorrectionAtRef = useRef<number>(0);
  const canControlVideoRef = useRef<boolean>(false);
  const lastCurrentVideoIdRef = useRef<string | null>(null);
  const syncAnchorRef = useRef<{ time: number; at: number; playing: boolean; videoId?: string | null }>({
    time: 0,
    at: Date.now(),
    playing: false,
    videoId: null,
  });

  const isCurrentParticipant = useCallback((participant: { id?: string; email?: string | null; name?: string }) => {
    const pid = participant?.id || "";
    const pmail = participant?.email || "";
    if (pid && (pid === currentUser.id || (authUserId && pid === authUserId))) return true;
    if (pmail && currentUser.email && pmail === currentUser.email) return true;
    if (participant?.name && participant.name === currentUser.name) return true;
    return false;
  }, [authUserId, currentUser.email, currentUser.id, currentUser.name]);

  const roleFromParticipants =
    participants.find((participant) => isCurrentParticipant(participant))?.role || null;
  const effectiveRole: SalonRole | null = roleFromParticipants || role;
  const isAdmin = effectiveRole === "admin";
  const selfParticipant =
    participants.find((participant) => isCurrentParticipant(participant)) || null;
  const currentPermissionKeyCandidates = [
    selfParticipant?.id || null,
    authUserId,
    currentUser.id || null,
  ].filter(Boolean) as string[];
  const currentPermissionsFromMap =
    currentPermissionKeyCandidates
      .map((id) => participantPermissions[id])
      .find(Boolean) || null;
  const currentPermissions =
    currentPermissionsFromMap ||
    normalizePermissions(effectiveRole, null);
  const canControlVideo =
    effectiveRole === "admin" || effectiveRole === "regie" || currentPermissions.video;
  const canUseChat =
    effectiveRole === "admin" ? true : currentPermissions.chat && !currentPermissions.muted;
  const canManagePlaylist =
    effectiveRole === "admin" || effectiveRole === "regie" || currentPermissions.playlist;
  const canUsePolls =
    effectiveRole === "admin" || currentPermissions.polls;
  // Keep a ref updated so Supabase Realtime closures always see the current value
  canControlVideoRef.current = canControlVideo;
  const voteStorageKey = `room_${roomId}_videoVotes`;
  const reactionStorageKey = `room_${roomId}_messageReactions`;
  const permissionsStorageKey = `room_${roomId}_participantPermissions`;
  const regieHistoryStorageKey = `room_${roomId}_regie_history`;
  const videoBookmarksStorageKey = `room_${roomId}_video_bookmarks`;
  const sessionLockStorageKey = `room_${roomId}_session_lock_state`;
  const backendSessionLockStorageKey =
    backendSalonId && UUID_REGEX.test(backendSalonId) ? `room_${backendSalonId}_session_lock_state` : null;
  const isSessionRestricted =
    sessionLockState.roomLocked || sessionLockState.chatDisabled || sessionLockState.focusMode;
  const isChatBlockedForViewer = !canControlVideo && (sessionLockState.chatDisabled || sessionLockState.focusMode);
  const canSendChat = canUseChat && !isChatBlockedForViewer;

  const persistRegieHistory = useCallback((entries: RegieActionEntry[]) => {
    try {
      localStorage.setItem(regieHistoryStorageKey, JSON.stringify(entries));
    } catch (error) {
      console.error("Erreur sauvegarde historique regie:", error);
    }
  }, [regieHistoryStorageKey]);

  const persistSessionLockState = useCallback((state: SessionLockState) => {
    try {
      localStorage.setItem(sessionLockStorageKey, JSON.stringify(state));
      if (backendSessionLockStorageKey) {
        localStorage.setItem(backendSessionLockStorageKey, JSON.stringify(state));
      }
    } catch (error) {
      console.error("Erreur sauvegarde verrouillage session:", error);
    }
  }, [backendSessionLockStorageKey, sessionLockStorageKey]);

  const persistVideoBookmarks = useCallback((entries: VideoBookmarkEntry[]) => {
    try {
      localStorage.setItem(videoBookmarksStorageKey, JSON.stringify(entries));
    } catch (error) {
      console.error("Erreur sauvegarde marque-pages:", error);
    }
  }, [videoBookmarksStorageKey]);

  const describeSessionLockState = useCallback((state: SessionLockState) => {
    const active: string[] = [];
    if (state.roomLocked) active.push("salle verrouillee");
    if (state.chatDisabled) active.push("chat desactive");
    if (state.focusMode) active.push("mode focus");
    return active.length > 0 ? active.join(", ") : "aucune restriction active";
  }, []);

  const appendRegieAction = useCallback((entry: RegieActionEntry) => {
    setRegieActionHistory((prev) => {
      if (prev.some((item) => item.id === entry.id)) return prev;
      const next = [entry, ...prev].slice(0, 100);
      persistRegieHistory(next);
      return next;
    });
  }, [persistRegieHistory]);

  const appendVideoBookmark = useCallback((entry: VideoBookmarkEntry) => {
    setVideoBookmarks((prev) => {
      if (prev.some((item) => item.id === entry.id)) return prev;
      const next = [entry, ...prev].slice(0, 300);
      persistVideoBookmarks(next);
      return next;
    });
  }, [persistVideoBookmarks]);

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
    p.id !== authUserId &&
    p.email !== currentUser.email &&
    p.id !== currentUser.email &&
    p.name !== currentUser.name
  );

  const participantCount = otherParticipants.filter(p => p.status === "online").length + 1; // +1 pour l'utilisateur courant
  const currentVideo = playlist.find(v => v.isCurrent);
  const currentVideoBookmarks = currentVideo
    ? videoBookmarks
      .filter((bookmark) => bookmark.videoId === currentVideo.id)
      .sort((a, b) => a.time - b.time)
    : [];
  useEffect(() => {
    messageSalonColumnRef.current = messageSalonColumn;
  }, [messageSalonColumn]);

  useEffect(() => {
    salonIdColumnRef.current = salonIdColumn;
  }, [salonIdColumn]);

  const updateSalonState = useCallback(
    async (patch: Record<string, any>) => {
      if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) {
        return { error: new Error("Salon introuvable") };
      }

      const normalizedPatch: Record<string, any> = { ...patch };
      if (normalizedPatch.video_time !== undefined && normalizedPatch.video_time !== null) {
        const n = Number(normalizedPatch.video_time);
        normalizedPatch.video_time = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
      }

      const candidates = [salonIdColumnRef.current, ...SALON_ID_COLUMNS.filter((c) => c !== salonIdColumnRef.current)];
      let lastError: any = null;
      for (const column of candidates) {
        const { error } = await supabase.from('salon').update(normalizedPatch).eq(column, backendSalonId);
        if (!error) {
          salonIdColumnRef.current = column;
          if (column !== salonIdColumn) setSalonIdColumn(column);
          return { error: null };
        }
        lastError = error;
        if (!hasMissingColumnError(error, column)) break;
      }
      return { error: lastError || new Error("Erreur update salon") };
    },
    [backendSalonId, salonIdColumn]
  );

  const selectSalonSingle = useCallback(
    async (selectClause: string) => {
      if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) {
        return { data: null, error: new Error("Salon introuvable") };
      }

      const candidates = [salonIdColumnRef.current, ...SALON_ID_COLUMNS.filter((c) => c !== salonIdColumnRef.current)];
      let lastError: any = null;
      for (const column of candidates) {
        const { data, error } = await supabase
          .from('salon')
          .select(selectClause)
          .eq(column, backendSalonId)
          .single();
        if (!error) {
          salonIdColumnRef.current = column;
          if (column !== salonIdColumn) setSalonIdColumn(column);
          return { data, error: null };
        }
        lastError = error;
        if (!hasMissingColumnError(error, column)) break;
      }
      return { data: null, error: lastError || new Error("Erreur lecture salon") };
    },
    [backendSalonId, salonIdColumn]
  );
  const loadParticipantsSnapshot = useCallback(async () => {
    const data = await withFallback(backendSalonId, roomId, fetchParticipants);
    const current = (data || []).find((participant: any) => isCurrentParticipant(participant));
    if (current?.role && current.role !== role) {
      setRole(current.role as SalonRole);
    }
    const mapped = (data || []).map((participant: any) => ({
      id: participant.id,
      name: participant.name ?? "Utilisateur",
      email: participant.email ?? null,
      role: (participant.role || "member") as SalonRole,
      status: (participant.is_active ? "online" : "offline") as "online" | "offline",
      avatar: createAvatarDataUrl(participant.name ?? "Utilisateur"),
    }));
    setParticipants(mapped);
    setParticipantPermissionsMap((prev) => {
      const next: PermissionsByParticipant = {};
      for (const participant of data || []) {
        if (!participant?.id) continue;
        const normalizedRole = (participant.role || "member") as SalonRole;
        next[participant.id] = normalizePermissions(
          normalizedRole,
          participant.permissions || prev[participant.id]
        );
      }
      return next;
    });
  }, [backendSalonId, roomId, role, currentUser.id, currentUser.email, isCurrentParticipant]);

  const loadMessagesSnapshot = useCallback(async () => {
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) return;

    let messagesData: any[] | null = null;
    let msgError: any = null;
    let resolvedSalonColumn: MessageRoomColumn = messageSalonColumnRef.current;

    ({ data: messagesData, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq(resolvedSalonColumn, backendSalonId));

    // Schema fallback for messages room column.
    for (let i = 0; msgError && i < MESSAGE_ROOM_COLUMNS.length - 1; i += 1) {
      if (!hasMissingColumnError(msgError, resolvedSalonColumn)) break;
      resolvedSalonColumn = getNextMessageRoomColumn(resolvedSalonColumn);
      ({ data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq(resolvedSalonColumn, backendSalonId));
      if (!msgError) {
        messageSalonColumnRef.current = resolvedSalonColumn;
        if (resolvedSalonColumn !== messageSalonColumn) {
          setMessageSalonColumn(resolvedSalonColumn);
        }
      }
    }

    if (msgError) return;

    const canSenderChat = (senderId: string | null) => {
      if (!senderId) return true;
      const senderRole =
        participants.find((p) => p.id === senderId)?.role || null;
      const senderPermissions =
        participantPermissions[senderId] || normalizePermissions(senderRole, null);
      return senderPermissions.chat && !senderPermissions.muted;
    };

    const mappedMessages = (messagesData || [])
      .filter((msg: any) => {
        const senderId = msg.user_id || msg.id_user || null;
        return canSenderChat(senderId ? String(senderId) : null);
      })
      .sort((a: any, b: any) => {
        const ta = new Date(a.sent_at || a.created_at || 0).getTime();
        const tb = new Date(b.sent_at || b.created_at || 0).getTime();
        return ta - tb;
      })
      .map((msg: any) => mapDbMessageToUi(msg, currentUser))
      .map((msg) => {
        const stored = storedReactionsByMessage[msg.id] || [];
        return {
          ...msg,
          reactions: stored.map((entry) => ({
            emoji: entry.emoji,
            count: entry.userIds.length,
            userIds: entry.userIds,
          })),
        };
      });
    setMessages(mappedMessages);
  }, [backendSalonId, messageSalonColumn, currentUser.email, currentUser.id, currentUser.name, storedReactionsByMessage, participants, participantPermissions]);

  const loadRoomSnapshot = useCallback(async () => {
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) return;

    await loadMessagesSnapshot();

    // Load salon state (without video(*) join which can fail if FK is not properly configured)
    const { data: salonData, error: salonError } = await selectSalonSingle(
      'current_video_id, id_playlist, video_time, video_status'
    );

    if (salonError || !salonData) {
      // Fallback: attempt to load playlist even if salon state read fails
      console.warn("Erreur lecture état salon, tentative chargement playlist directement", salonError);
      try {
        const fallbackData = await fetchPlaylist(backendSalonId);
        setPlaylistId(fallbackData.playlistId);
        const fallbackMapped = (fallbackData.items || []).map((item: any, index: number) => {
          const youtubeId = item.youtube_id;
          return {
            id: item.id,
            youtubeId,
            title: item.titre ?? "Sans titre",
            thumbnail: youtubeId
              ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
              : THUMBNAIL_MOVIE,
            duration: item.duration ? String(item.duration) : "0:00",
            isCurrent: index === 0,
            votes: videoVoteCounts[item.id] ?? 0,
            isFavorite: youtubeId ? favoriteIds.has(youtubeId) : false,
          };
        });
        if (fallbackMapped.length > 0) setPlaylist(fallbackMapped);
      } catch (fallbackErr) {
        console.error("Fallback playlist load failed", fallbackErr);
      }
      return;
    }

    const sd = salonData as any;
    const dbTime = Number(sd?.video_time || 0);
    setCurrentTime(dbTime);
    setIsPlaying(sd?.video_status === "playing");
    setSyncNonce(Date.now());

    // Load playlist
    const playlistData = sd?.id_playlist
      ? await fetchPlaylistById(sd.id_playlist)
      : await fetchPlaylist(backendSalonId);

    setPlaylistId(playlistData.playlistId);
    const mapped = (playlistData.items || []).map((item: any, index: number) => {
      const youtubeId = item.youtube_id;
      const isCurrent = sd?.current_video_id
        ? item.id === sd.current_video_id
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
  }, [backendSalonId, currentUser.email, favoriteIds, videoVoteCounts, loadMessagesSnapshot, selectSalonSingle]);

  useEffect(() => {
    setRoomCode(roomId);
    // Fast path: if route already contains salon UUID, use it immediately.
    if (UUID_REGEX.test(roomId)) {
      setBackendSalonId(roomId);
    }
  }, [roomId]);

  useEffect(() => {
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) return;
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
    if (!roomId) return;
    const fetchSalonId = async () => {
      try {
        const data = await fetchSalonByCode(roomId);
        const resolvedSalonId = data.id_salon || data.id;
        if (!resolvedSalonId || !UUID_REGEX.test(String(resolvedSalonId))) {
          throw new Error("Salon introuvable");
        }
        setBackendSalonId(resolvedSalonId);
        // Always expose a shareable join code in the UI dialog.
        setRoomCode(data.invitation_code || data.room_code || resolvedSalonId);
        if (data.owner_id) {
          setRole(currentUser.id === data.owner_id ? "admin" : "member");
        }
      } catch (error) {
        console.error("Erreur ID salon", error);
      }
    };
    fetchSalonId();
  }, [roomId, currentUser.id]);

  useEffect(() => {
    const loadAuthUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setAuthUserId(data?.user?.id || null);
      } catch {
        setAuthUserId(null);
      }
    };
    loadAuthUser();
  }, []);

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
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) return;

    loadRoomSnapshot().catch((error) => {
      console.error("Erreur chargement initial", error);
    });

    // 3. Realtime Subscription (Messages AND Salon Updates)
    const channel = supabase
      .channel(`room-${backendSalonId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as any;
          const belongsToRoom = MESSAGE_ROOM_COLUMNS.some((column) => {
            const value = newMsg?.[column];
            return typeof value === "string" && value === backendSalonId;
          });
          if (!belongsToRoom) return;
          const senderId = newMsg?.user_id || newMsg?.id_user || null;
          if (senderId) {
            const sid = String(senderId);
            const senderRole = participants.find((p) => p.id === sid)?.role || null;
            const senderPermissions =
              participantPermissions[sid] || normalizePermissions(senderRole, null);
            if (!senderPermissions.chat || senderPermissions.muted) return;
          }
          const mapped = mapDbMessageToUi(newMsg, currentUser);
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
          lastRealtimeSyncAtRef.current = Date.now();
          const newSalonState = payload.new;
          const nextTime = Number(newSalonState?.video_time || 0);

          // Viewers follow salon state strictly.
          if (!canControlVideoRef.current) {
            setCurrentTime(nextTime);
            setIsPlaying(newSalonState?.video_status === "playing");
            setSyncNonce(Date.now());
            lastAdminPlayerTimeRef.current = nextTime;
            syncAnchorRef.current = {
              time: nextTime,
              at: Date.now(),
              playing: newSalonState?.video_status === "playing",
              videoId: newSalonState?.current_video_id ? String(newSalonState.current_video_id) : null,
            };
          }

          if (newSalonState.current_video_id) {
            const targetVideoId = String(newSalonState.current_video_id);
            const videoChanged = lastCurrentVideoIdRef.current !== targetVideoId;
            lastCurrentVideoIdRef.current = targetVideoId;

            let found = false;
            setPlaylist((prev) =>
              prev.map((p) => {
                const isCurrent = p.id === targetVideoId;
                if (isCurrent) found = true;
                return { ...p, isCurrent };
              })
            );

            // If video not found in playlist, reload. No toast here — the broadcast handles it.
            if (!found) {
              await loadRoomSnapshot();
            } else if (videoChanged) {
              // Only notify via this channel if no broadcast is expected
              // (broadcast from admin will show its own toast)
              // So we skip toast here — broadcasts handle all notifications
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
          lastRealtimeSyncAtRef.current = Date.now();
          const data = payload?.payload || {};
          // Ignore messages sent by the current user
          if (data?.by === currentUser.id) return;

          // Apply time sync
          if (typeof data.time === "number") {
            const nextTime = Math.max(0, data.time);
            setCurrentTime(nextTime);
            setSyncNonce(Date.now());
            lastAdminPlayerTimeRef.current = nextTime;
            syncAnchorRef.current = {
              time: nextTime,
              at: Date.now(),
              playing: typeof data.isPlaying === "boolean" ? data.isPlaying : isPlayingRef.current,
              videoId: data.videoId ? String(data.videoId) : syncAnchorRef.current.videoId,
            };
          }
          if (typeof data.isPlaying === "boolean") {
            setIsPlaying(data.isPlaying);
          }

          // Update playlist if videoId changed
          if (data.videoId) {
            let found = false;
            setPlaylist((prev) =>
              prev.map((item) => {
                const isCurrent = item.id === data.videoId;
                if (isCurrent) found = true;
                return { ...item, isCurrent };
              })
            );
            if (!found) {
              await loadRoomSnapshot();
            }
          }

          if (data.forceReload) {
            await loadRoomSnapshot();
          }

          // Show toast only for explicit syncs triggered by admin (not automatic heartbeats/seeks)
          // data.seek is set on auto-seeks, data.explicit is set on manual sync button
          if (data.restart) {
            toast.info("La vidéo redémarre depuis le début 🔄");
          } else if (data.explicit) {
            toast.info("📡 Synchronisation reçue");
          }
        }
      )
      .on(
        'broadcast',
        { event: 'room_regie_notification' },
        async (payload) => {
          const data = payload?.payload || {};
          if (!data?.message || data?.by === currentUser.id) return;

          toast.info(String(data.message), {
            description: data?.byName ? `Annonce de ${data.byName}` : "Annonce de la regie",
            duration: 5000,
          });
        }
      )
      .on(
        'broadcast',
        { event: 'room_regie_action' },
        async (payload) => {
          const entry = payload?.payload?.entry as RegieActionEntry | undefined;
          if (!entry?.id) return;
          appendRegieAction(entry);
        }
      )
      .on(
        'broadcast',
        { event: 'room_video_bookmark_added' },
        async (payload) => {
          const data = payload?.payload || {};
          const entry = data?.entry as VideoBookmarkEntry | undefined;
          if (!entry?.id || data?.by === currentUser.id) return;

          appendVideoBookmark(entry);
          toast.info("Nouveau marque-page ajoute", {
            description: `${entry.label} • ${formatVideoTimeLabel(entry.time)}`,
            duration: 3500,
          });
        }
      )
      .on(
        'broadcast',
        { event: 'room_session_lock_state' },
        async (payload) => {
          const data = payload?.payload || {};
          if (data?.by === currentUser.id || !data?.state) return;

          const nextState: SessionLockState = {
            roomLocked: Boolean(data.state.roomLocked),
            chatDisabled: Boolean(data.state.chatDisabled),
            focusMode: Boolean(data.state.focusMode),
            updatedBy: data?.byName,
            updatedAt: typeof data?.at === "number" ? data.at : Date.now(),
          };

          setSessionLockState(nextState);
          persistSessionLockState(nextState);

          toast.info("Verrouillage de session mis a jour", {
            description: describeSessionLockState(nextState),
            duration: 4000,
          });
        }
      )
      .subscribe();

    roomChannelRef.current = channel;

    return () => {
      roomChannelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [roomId, backendSalonId, currentUser.id, loadRoomSnapshot, loadParticipantsSnapshot, currentUser.email, canControlVideo, participants, participantPermissions, appendRegieAction, appendVideoBookmark, describeSessionLockState, persistSessionLockState]);

  useEffect(() => {
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) return;

    const refreshMessages = async () => {
      try {
        await loadMessagesSnapshot();
      } catch (error) {
        console.error("Erreur refresh messages", error);
      }
    };

    refreshMessages();
    const interval = window.setInterval(refreshMessages, 3000);
    return () => window.clearInterval(interval);
  }, [backendSalonId, loadMessagesSnapshot]);

  useEffect(() => {
    let isMounted = true;

    const readLocalHistory = () => {
      try {
        const raw = localStorage.getItem(regieHistoryStorageKey);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Erreur chargement historique regie local:", error);
        return [];
      }
    };

    const loadRegieHistory = async () => {
      const localEntries = readLocalHistory();

      if (isMounted) {
        setRegieActionHistory(localEntries);
      }

      if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) {
        return;
      }

      try {
        const remoteEntries = await fetchRegieHistory(backendSalonId);
        if (!isMounted) return;

        const merged = mergeRegieHistoryEntries(remoteEntries, localEntries);
        setRegieActionHistory(merged);
        persistRegieHistory(merged);
      } catch (error) {
        console.error("Erreur chargement historique regie base:", error);
      }
    };

    void loadRegieHistory();

    return () => {
      isMounted = false;
    };
  }, [backendSalonId, persistRegieHistory, regieHistoryStorageKey]);

  useEffect(() => {
    let isMounted = true;

    const readLocalBookmarks = () => {
      try {
        const raw = localStorage.getItem(videoBookmarksStorageKey);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Erreur chargement marque-pages local:", error);
        return [];
      }
    };

    const loadBookmarks = async () => {
      const localEntries = readLocalBookmarks();

      if (isMounted) {
        setVideoBookmarks(localEntries);
      }

      if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) {
        return;
      }

      try {
        const remoteEntries = await fetchVideoBookmarks(backendSalonId);
        if (!isMounted) return;

        const merged = mergeVideoBookmarkEntries(remoteEntries, localEntries);
        setVideoBookmarks(merged);
        persistVideoBookmarks(merged);
      } catch (error) {
        console.error("Erreur chargement marque-pages base:", error);
      }
    };

    void loadBookmarks();

    return () => {
      isMounted = false;
    };
  }, [backendSalonId, persistVideoBookmarks, videoBookmarksStorageKey]);

  useEffect(() => {
    try {
      const raw =
        (backendSessionLockStorageKey ? localStorage.getItem(backendSessionLockStorageKey) : null) ||
        localStorage.getItem(sessionLockStorageKey);

      if (!raw) {
        setSessionLockState(DEFAULT_SESSION_LOCK_STATE);
        return;
      }

      const parsed = JSON.parse(raw);
      setSessionLockState({
        roomLocked: Boolean(parsed?.roomLocked),
        chatDisabled: Boolean(parsed?.chatDisabled),
        focusMode: Boolean(parsed?.focusMode),
        updatedBy: parsed?.updatedBy,
        updatedAt: parsed?.updatedAt,
      });
    } catch (error) {
      console.error("Erreur chargement verrouillage session:", error);
      setSessionLockState(DEFAULT_SESSION_LOCK_STATE);
    }
  }, [backendSessionLockStorageKey, sessionLockStorageKey]);

  useEffect(() => {
    if (!sessionLockState.focusMode) return;
    if (canControlVideo) return;
    if (activeTab !== "chat") return;
    setActiveTab("participants");
  }, [activeTab, canControlVideo, sessionLockState.focusMode]);

  useEffect(() => {
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) return;
    if (canControlVideo) return;

    let isSyncing = false;
    const syncFromSalon = async () => {
      if (isSyncing) return; // Éviter les appels overlapping
      isSyncing = true;
      try {
        const { data, error } = await selectSalonSingle('current_video_id, video_time, video_status');
        if (error || !data) return;

        const salonData = data as any;
        const nextTime = Number(salonData.video_time || 0);
        const nextPlaying = salonData.video_status === "playing";

        setCurrentTime(nextTime);
        setSyncNonce(Date.now());
        setIsPlaying(nextPlaying);

        if (salonData.current_video_id) {
          const target = String(salonData.current_video_id);
          setPlaylist((prev) => {
            const exists = prev.some((item) => item.id === target);
            if (!exists) {
              // trigger reload asynchronously outside setState
              setTimeout(() => loadRoomSnapshot(), 0);
              return prev;
            }
            return prev.map((item) => ({ ...item, isCurrent: item.id === target }));
          });
        }
      } catch (err) {
        console.error("Erreur sync automatique salon", err);
      } finally {
        isSyncing = false;
      }
    };

    syncFromSalon();
    const interval = window.setInterval(syncFromSalon, 3000);
    return () => window.clearInterval(interval);
  }, [backendSalonId, canControlVideo, loadRoomSnapshot, selectSalonSingle]);

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
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

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
    try {
      const raw = localStorage.getItem(reactionStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === "object") {
        setStoredReactionsByMessage(parsed as MessageReactionsById);
      } else {
        setStoredReactionsByMessage({});
      }
    } catch (error) {
      console.error("Erreur chargement reactions messages:", error);
      setStoredReactionsByMessage({});
    }
  }, [reactionStorageKey]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(permissionsStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === "object") {
        setParticipantPermissionsMap(parsed as PermissionsByParticipant);
      }
    } catch (error) {
      console.error("Erreur chargement permissions participants:", error);
    }
  }, [permissionsStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(reactionStorageKey, JSON.stringify(storedReactionsByMessage));
    } catch (error) {
      console.error("Erreur sauvegarde reactions messages:", error);
    }
  }, [reactionStorageKey, storedReactionsByMessage]);

  useEffect(() => {
    try {
      localStorage.setItem(permissionsStorageKey, JSON.stringify(participantPermissions));
    } catch (error) {
      console.error("Erreur sauvegarde permissions participants:", error);
    }
  }, [permissionsStorageKey, participantPermissions]);

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
    if (!canUseChat) {
      toast.error("Le chat est desactive pour vous");
      return;
    }
    if (isChatBlockedForViewer) {
      toast.error(
        sessionLockState.focusMode
          ? "Le chat est masque pendant le mode focus"
          : "Le chat est temporairement desactive par la regie"
      );
      return;
    }
    if (!UUID_REGEX.test(backendSalonId)) {
      toast.error("Salon introuvable pour l'envoi du message");
      return;
    }

    const sendChatContent = async (content: string) => {
      let error: any = null;

      const roomColumnCandidates = [messageSalonColumn, ...MESSAGE_ROOM_COLUMNS.filter((col) => col !== messageSalonColumn)];
      const userColumnCandidates = [messageUserColumn, ...MESSAGE_AUTHOR_COLUMNS.filter((col) => col !== messageUserColumn)];
      let lastInsertError: any = null;

      for (const roomColumn of roomColumnCandidates) {
        for (const userColumn of userColumnCandidates) {
          ({ error } = await supabase
            .from('messages')
            .insert([
              {
                [roomColumn]: backendSalonId,
                [userColumn]: getMessageAuthorValue(userColumn, { id: currentUser.id, name: currentUser.name }),
                content,
              }
            ]));

          if (!error) {
            if (roomColumn !== messageSalonColumn) setMessageSalonColumn(roomColumn);
            if (userColumn !== messageUserColumn) setMessageUserColumn(userColumn);
            lastInsertError = null;
            break;
          }

          lastInsertError = error;
          const roomMissing = hasMissingColumnError(error, roomColumn);
          const userMissing = hasMissingColumnError(error, userColumn);
          if (!roomMissing && !userMissing) break;
        }

        if (!lastInsertError) break;
      }

      if (lastInsertError) error = lastInsertError;
      if (error) throw error;
    };

    try {
      await sendChatContent(newMessage.trim());

      // We don't need to manually update state here because the Realtime subscription
      // will pick up the new message (INSERT event) and add it to the list.
      // But we clear the input immediately.
      setNewMessage("");
      await loadMessagesSnapshot();

    } catch (error: any) {
      toast.error(getErrorMessage(error, "Erreur envoi message"));
      console.error(error);
    }
  };

  const handleReactionClick = async (emoji: string) => {
    if (!canUseChat) {
      toast.error("Le chat est desactive pour vous");
      return;
    }
    if (isChatBlockedForViewer) {
      toast.error(
        sessionLockState.focusMode
          ? "Les reactions sont bloquees pendant le mode focus"
          : "Le chat est temporairement desactive par la regie"
      );
      return;
    }
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) {
      toast.error("Salon introuvable pour l'envoi de l'emoji");
      return;
    }

    try {
      let error: any = null;
      const roomColumnCandidates = [messageSalonColumn, ...MESSAGE_ROOM_COLUMNS.filter((col) => col !== messageSalonColumn)];
      const userColumnCandidates = [messageUserColumn, ...MESSAGE_AUTHOR_COLUMNS.filter((col) => col !== messageUserColumn)];
      let lastInsertError: any = null;

      for (const roomColumn of roomColumnCandidates) {
        for (const userColumn of userColumnCandidates) {
          ({ error } = await supabase
            .from('messages')
            .insert([
              {
                [roomColumn]: backendSalonId,
                [userColumn]: getMessageAuthorValue(userColumn, { id: currentUser.id, name: currentUser.name }),
                content: emoji,
              }
            ]));

          if (!error) {
            if (roomColumn !== messageSalonColumn) setMessageSalonColumn(roomColumn);
            if (userColumn !== messageUserColumn) setMessageUserColumn(userColumn);
            lastInsertError = null;
            break;
          }

          lastInsertError = error;
          const roomMissing = hasMissingColumnError(error, roomColumn);
          const userMissing = hasMissingColumnError(error, userColumn);
          if (!roomMissing && !userMissing) break;
        }

        if (!lastInsertError) break;
      }

      if (lastInsertError) throw lastInsertError;
      await loadMessagesSnapshot();
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Erreur envoi emoji"));
      console.error(error);
    }
  };

  const handleMessageReaction = (messageId: string, emoji: string) => {
    if (!canUseChat) return;
    if (isChatBlockedForViewer) {
      toast.error(
        sessionLockState.focusMode
          ? "Les reactions sont bloquees pendant le mode focus"
          : "Le chat est temporairement desactive par la regie"
      );
      return;
    }    const userId = currentUser.id || currentUser.email || "current";
    setStoredReactionsByMessage((prev) => {
      const currentEntries = prev[messageId] || [];
      const reactionIndex = currentEntries.findIndex((entry) => entry.emoji === emoji);
      let nextEntries = [...currentEntries];

      if (reactionIndex >= 0) {
        const existing = nextEntries[reactionIndex];
        const alreadyReacted = existing.userIds.includes(userId);
        if (alreadyReacted) {
          const filteredUsers = existing.userIds.filter((id) => id !== userId);
          if (filteredUsers.length === 0) {
            nextEntries.splice(reactionIndex, 1);
          } else {
            nextEntries[reactionIndex] = { ...existing, userIds: filteredUsers };
          }
        } else {
          nextEntries[reactionIndex] = {
            ...existing,
            userIds: [...existing.userIds, userId],
          };
        }
      } else {
        nextEntries.push({ emoji, userIds: [userId] });
      }

      const nextMap: MessageReactionsById = { ...prev };
      if (nextEntries.length === 0) {
        delete nextMap[messageId];
      } else {
        nextMap[messageId] = nextEntries;
      }

      setMessages((oldMessages) =>
        oldMessages.map((msg) =>
          msg.id === messageId
            ? {
              ...msg,
              reactions: (nextMap[messageId] || []).map((entry) => ({
                emoji: entry.emoji,
                count: entry.userIds.length,
                userIds: entry.userIds,
              })),
            }
            : msg
        )
      );

      return nextMap;
    });
  };

  const handlePlayPause = async () => {
    if (!canControlVideo) {
      toast.error("Seuls l'admin ou la regie video peuvent controler la lecture");
      return;
    }
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    isPlayingRef.current = newPlayingState;
    setSyncNonce(Date.now());

    if (backendSalonId) {
      try {
        const { error: playPauseError } = await updateSalonState({
          video_status: newPlayingState ? 'playing' : 'paused',
          video_time: currentTimeRef.current,
          current_video_id: currentVideo?.id || null,
        });
        if (playPauseError) throw playPauseError;

        if (roomChannelRef.current) {
          await roomChannelRef.current.send({
            type: 'broadcast',
            event: 'room_force_sync',
            payload: {
              by: currentUser.id,
              at: Date.now(),
              isPlaying: newPlayingState,
              time: currentTimeRef.current,
              videoId: currentVideo?.id || null,
              forceSeek: true,
              forceReload: true,
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
    void broadcastRegieAction(
      newPlayingState ? "play" : "pause",
      newPlayingState ? "Lecture relancee" : "Video mise en pause"
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
    if (!canControlVideo) {
      toast.error("Seuls l'admin ou la regie video peuvent synchroniser");
      return;
    }
    if (!backendSalonId) {
      toast.error("Salon introuvable pour la synchronisation");
      return;
    }

    let syncSucceeded = true;
    try {
      const { error: syncError } = await updateSalonState({
        video_time: currentTimeRef.current,
        video_status: isPlaying ? 'playing' : 'paused',
        current_video_id: currentVideo?.id || null
      });
      if (syncError) throw syncError;

      await loadRoomSnapshot();
      if (roomChannelRef.current) {
        await roomChannelRef.current.send({
          type: 'broadcast',
          event: 'room_force_sync',
          payload: {
            by: currentUser.id,
            at: Date.now(),
            time: currentTimeRef.current,
            isPlaying,
            videoId: currentVideo?.id || null,
            seek: true,
            forceSeek: true,
            forceReload: true,
            explicit: true,
          }
        });
      }
      toast.success("📡 Synchronisation envoyée à tous les invités");
    } catch (error: any) {
      syncSucceeded = false;
      toast.error(error?.message || "Erreur synchronisation");
      console.error("Erreur sync salon", error);
    }
    if (syncSucceeded) {
      void broadcastRegieAction("sync", "Synchronisation envoyee", "La regie a resynchronise tous les participants");
    }
  };

  const broadcastRegieAction = async (
    type: RegieActionEntry["type"],
    label: string,
    details?: string
  ) => {
    const entry: RegieActionEntry = {
      id: createClientUuid(),
      type,
      label,
      details,
      byName: currentUser.name,
      createdAt: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    appendRegieAction(entry);

    if (backendSalonId && UUID_REGEX.test(backendSalonId)) {
      try {
        await createRegieHistoryEntry(backendSalonId, entry);
      } catch (error: any) {
        console.error("Erreur sauvegarde historique regie en base", error);
        toast.error("Historique regie non enregistre dans Supabase", {
          description: error?.message || "Verifie la table regie_action_history et ses policies.",
          duration: 5000,
        });
      }
    }

    if (!roomChannelRef.current) return;

    try {
      await roomChannelRef.current.send({
        type: 'broadcast',
        event: 'room_regie_action',
        payload: { entry }
      });
    } catch (error) {
      console.error("Erreur broadcast historique regie", error);
    }
  };

  const handleSendAnnouncement = async (message: string) => {
    if (!canControlVideo) {
      toast.error("Seuls l'admin ou la regie video peuvent envoyer une annonce");
      return;
    }
    if (!backendSalonId || !roomChannelRef.current) {
      toast.error("Salon introuvable pour l'envoi de l'annonce");
      return;
    }

    try {
      await roomChannelRef.current.send({
        type: 'broadcast',
        event: 'room_regie_notification',
        payload: {
          by: currentUser.id,
          byName: currentUser.name,
          at: Date.now(),
          message,
        }
      });

      toast.success("Annonce envoyee a tous les participants");
      void broadcastRegieAction("announcement", "Annonce envoyee", message);
    } catch (error: any) {
      console.error("Erreur annonce regie", error);
      toast.error(error?.message || "Impossible d'envoyer l'annonce");
      throw error;
    }
  };

  const handleApplySessionLock = async (nextState: SessionLockState) => {
    if (!canControlVideo) {
      toast.error("Seuls l'admin ou la regie video peuvent modifier la session");
      return;
    }

    const normalizedState: SessionLockState = {
      roomLocked: Boolean(nextState.roomLocked),
      chatDisabled: Boolean(nextState.chatDisabled),
      focusMode: Boolean(nextState.focusMode),
      updatedBy: currentUser.name,
      updatedAt: Date.now(),
    };

    setSessionLockState(normalizedState);
    persistSessionLockState(normalizedState);

    if (roomChannelRef.current) {
      try {
        await roomChannelRef.current.send({
          type: "broadcast",
          event: "room_session_lock_state",
          payload: {
            by: currentUser.id,
            byName: currentUser.name,
            at: normalizedState.updatedAt,
            state: normalizedState,
          },
        });
      } catch (error) {
        console.error("Erreur broadcast verrouillage session", error);
      }
    }

    toast.success("Verrouillage de session mis a jour");
    void broadcastRegieAction(
      "session_lock",
      "Verrouillage de session mis a jour",
      describeSessionLockState(normalizedState)
    );
  };

  const handleAddBookmark = async (label: string) => {
    if (!canControlVideo) {
      toast.error("Seuls l'admin ou la regie video peuvent ajouter un marque-page");
      return;
    }
    if (!currentVideo?.id) {
      toast.error("Aucune video en cours pour ajouter un marque-page");
      return;
    }
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) {
      toast.error("Salon introuvable pour enregistrer le marque-page");
      return;
    }

    const draftEntry: VideoBookmarkEntry = {
      id: createClientUuid(),
      videoId: currentVideo.id,
      videoTitle: currentVideo.title,
      time: currentTimeRef.current,
      label,
      byName: currentUser.name,
      createdAt: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    let entry = draftEntry;

    try {
      entry = await createVideoBookmark({
        id: draftEntry.id,
        salonId: backendSalonId,
        videoId: draftEntry.videoId,
        videoTitle: draftEntry.videoTitle,
        time: draftEntry.time,
        label: draftEntry.label,
        byName: draftEntry.byName,
        createdAt: draftEntry.createdAt,
      });
    } catch (error: any) {
      console.error("Erreur sauvegarde marque-page en base", error);
      toast.error("Marque-page non enregistre dans Supabase", {
        description: error?.message || "Verifie la table video_bookmarks et ses policies.",
        duration: 5000,
      });
      throw error;
    }

    appendVideoBookmark(entry);

    if (roomChannelRef.current) {
      try {
        await roomChannelRef.current.send({
          type: "broadcast",
          event: "room_video_bookmark_added",
          payload: {
            by: currentUser.id,
            byName: currentUser.name,
            at: Date.now(),
            entry,
          },
        });
      } catch (error) {
        console.error("Erreur broadcast marque-page", error);
      }
    }

    toast.success(`Marque-page ajoute a ${formatVideoTimeLabel(entry.time)}`);
    void broadcastRegieAction(
      "video_bookmark",
      "Marque-page ajoute",
      `${entry.label} • ${formatVideoTimeLabel(entry.time)}`
    );
  };

  const handleSeekToBookmark = async (bookmark: VideoBookmarkEntry) => {
    if (!canControlVideo) {
      toast.info("Seule la regie peut naviguer vers un marque-page");
      return;
    }
    if (!currentVideo?.id || bookmark.videoId !== currentVideo.id) {
      toast.error("Ce marque-page ne correspond pas a la video en cours");
      return;
    }

    const nextTime = Math.max(0, Math.floor(bookmark.time));
    setCurrentTime(nextTime);
    currentTimeRef.current = nextTime;
    setSyncNonce(Date.now());

    if (backendSalonId) {
      try {
        const { error } = await updateSalonState({
          video_time: nextTime,
          video_status: isPlayingRef.current ? "playing" : "paused",
          current_video_id: currentVideo.id,
        });
        if (error) throw error;

        if (roomChannelRef.current) {
          await roomChannelRef.current.send({
            type: "broadcast",
            event: "room_force_sync",
            payload: {
              by: currentUser.id,
              at: Date.now(),
              time: nextTime,
              isPlaying: isPlayingRef.current,
              videoId: currentVideo.id,
              seek: true,
              forceSeek: true,
              forceReload: false,
              explicit: true,
            },
          });
        }
      } catch (error) {
        console.error("Erreur navigation marque-page", error);
        toast.error("Impossible de naviguer vers ce marque-page");
        return;
      }
    }

    toast.success(`Retour a ${formatVideoTimeLabel(nextTime)}`);
    void broadcastRegieAction(
      "video_bookmark",
      "Navigation vers un marque-page",
      `${bookmark.label} • ${formatVideoTimeLabel(nextTime)}`
    );
  };

  const handleAddVideo = async (url: string, title: string) => {
    if (!canManagePlaylist) {
      toast.error("Vous n'avez pas la permission de modifier la playlist");
      return;
    }
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
      void broadcastRegieAction("video_add", "Video ajoutee", title);
      toast.success(`✅ Vidéo "${title}" ajoutée à la playlist !`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur ajout vidéo"));
      console.error(error);
    }
  };

  const handleRemoveVideo = async (videoId: string) => {
    if (!canManagePlaylist) {
      toast.error("Vous n'avez pas la permission de modifier la playlist");
      return;
    }
    const videoToRemove = playlist.find(v => v.id === videoId);
    try {
      const targetId = backendSalonId || roomId;
      await removeVideoFromPlaylist(targetId, videoId);
      setPlaylist(prev => prev.filter(v => v.id !== videoId));
      if (videoToRemove) {
        void broadcastRegieAction("video_remove", "Video supprimee", videoToRemove.title);
        toast.success(`🗑️ Vidéo "${videoToRemove.title}" supprimée`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur suppression vidéo"));
      console.error(error);
    }
  };

  const handleUpdatePermissions = (updatedParticipants: any[]) => {
    setParticipants((prev) =>
      prev.map((participant) => {
        const next = updatedParticipants.find((p) => p.id === participant.id);
        if (!next) return participant;
        const nextRole = (next.role || participant.role) as SalonRole;
        return { ...participant, role: nextRole };
      })
    );

    const updates: Array<{
      participantId: string;
      nextPermissions: MemberPermissions;
    }> = [];

    setParticipantPermissionsMap((prev) => {
      const nextMap = { ...prev };
      for (const participant of updatedParticipants) {
        const participantId = participant?.id;
        if (!participantId || String(participantId).startsWith("current-user-")) continue;
        const resolvedRole = (participant.role || participants.find((p) => p.id === participantId)?.role || "member") as SalonRole;
        const nextPermissions = normalizePermissions(
          resolvedRole,
          participant.permissions
        );
        const previousPermissions = prev[participantId] || normalizePermissions(resolvedRole, null);
        const changed =
          JSON.stringify(previousPermissions) !== JSON.stringify(nextPermissions);
        if (!changed) continue;
        nextMap[participantId] = nextPermissions;
        updates.push({
          participantId,
          nextPermissions,
        });
      }
      return nextMap;
    });

    void (async () => {
      // Same flow as regie: persist on salon_member then let postgres_changes propagate.
      let saveFailures = 0;
      for (const update of updates) {
        try {
          await setParticipantPermissionsApi(
            backendSalonId || roomId,
            update.participantId,
            update.nextPermissions
          );
        } catch (error: any) {
          saveFailures += 1;
          const msg = String(error?.message || "");
          if (msg.toLowerCase().includes("permission denied") || msg.toLowerCase().includes("row-level security")) {
            toast.error("Supabase RLS bloque la mise à jour des permissions.");
          } else {
            toast.error(getErrorMessage(error, "Impossible de sauvegarder les permissions"));
          }
        }
      }
      await loadParticipantsSnapshot();
      if (updates.length > 0 && saveFailures === 0) {
        toast.success("Permissions mises à jour");
      }
    })();
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
      if (!canControlVideo) {
        toast.error("Seuls l'admin ou la regie video peuvent changer de video");
        return;
      }

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
      lastAdminPlayerTimeRef.current = 0;

      // Admin et regie peuvent persister/synchroniser l'etat global du salon
      if (canControlVideo && backendSalonId) {
        const { error: updateError } = await updateSalonState({
          current_video_id: video.id,
          video_status: 'playing',
          video_time: 0
        });

        if (updateError) {
          console.error("Error updating salon video state", updateError);
          throw updateError;
        }

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
                forceSeek: true,
                forceReload: true,
                explicit: true,
              }
            });
          } catch (broadcastError) {
            console.warn("Broadcast error", broadcastError);
          }
        }
      }

      void broadcastRegieAction("video_play", "Changement de video", video.title);
    } catch (error) {
      console.error("Erreur changement vidéo", error);
      toast.error("Impossible de changer la vidéo");
    }
  };

  const handleAddVideosBatch = async (items: Array<{ url: string; title: string }>) => {
    if (!canManagePlaylist) {
      toast.error("Vous n'avez pas la permission de modifier la playlist");
      return;
    }
    try {
      const targetId = backendSalonId || roomId;
      const result = await addVideosToPlaylistBatch(targetId, items);
      const data = await fetchPlaylist(targetId);
      setPlaylistId(data.playlistId);
      const existingCurrentId = playlist.find(v => v.isCurrent)?.id;
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

      if (result.failedCount > 0) {
        toast.warning(`${result.addedCount} video(s) ajoutee(s), ${result.failedCount} echec(s)`);
      } else {
        toast.success(`${result.addedCount} video(s) ajoutee(s) a la playlist`);
      }
      void broadcastRegieAction("video_batch_add", "Ajout multiple de videos", `${result.addedCount} video(s) ajoutee(s)`);
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Erreur ajout multiple de videos"));
      console.error(error);
    }
  };

  const handlePlayerTimeUpdate = useCallback((seconds: number) => {
    if (!canControlVideoRef.current) {
      const anchor = syncAnchorRef.current;
      const expected = Math.max(
        0,
        anchor.time + (anchor.playing ? (Date.now() - anchor.at) / 1000 : 0)
      );
      const drift = Math.abs(seconds - expected);
      const now = Date.now();
      // Only correct if drift is significant (>3s) and enough time has passed (5s cooldown)
      if (drift > 3 && now - lastViewerCorrectionAtRef.current > 5000) {
        lastViewerCorrectionAtRef.current = now;
        setCurrentTime(expected);
        setSyncNonce(now);
      }
      return;
    }

    setCurrentTime(seconds);

    const previous = lastAdminPlayerTimeRef.current;
    lastAdminPlayerTimeRef.current = seconds;
    if (previous === null || !backendSalonId) return;

    // Keep salon timeline fresh while admin is playing (fallback for clients).
    const now = Date.now();
    if (
      isPlayingRef.current &&
      now - lastPlaybackPersistAtRef.current >= 2000
    ) {
      lastPlaybackPersistAtRef.current = now;
      void (async () => {
        const { error } = await updateSalonState({ video_time: seconds, video_status: 'playing' });
        if (error) {
          console.error("Erreur heartbeat lecture salon", error);
        }
      })();
    }

    // Detect explicit seeks (jump) and push the new timeline to all clients.
    const delta = Math.abs(seconds - previous);
    if (delta < 1) return;
    if (now - lastSeekBroadcastAtRef.current < 250) return;
    lastSeekBroadcastAtRef.current = now;

    void (async () => {
      const { error } = await updateSalonState({ video_time: seconds, video_status: isPlayingRef.current ? 'playing' : 'paused' });
      if (error) {
        console.error("Erreur update seek salon", error);
      }
    })();

    if (roomChannelRef.current) {
      void (async () => {
        try {
          await roomChannelRef.current.send({
            type: 'broadcast',
            event: 'room_force_sync',
            payload: {
              by: currentUser.id,
              at: now,
              time: seconds,
              videoId: currentVideo?.id || null,
              isPlaying: isPlayingRef.current,
              seek: true,
              forceSeek: true,
              forceReload: false,
            }
          });
        } catch (error: any) {
          console.error("Erreur broadcast seek", error);
        }
      })();
    }
  }, [backendSalonId, canControlVideo, currentUser.id, currentVideo?.id, updateSalonState]);

  const handleAdminPlaybackStateChange = useCallback((playing: boolean) => {
    if (!canControlVideo) return;

    const prev = isPlayingRef.current;
    setIsPlaying(playing);
    isPlayingRef.current = playing;
    if (prev === playing) return;
    if (!backendSalonId) return;

    const now = Date.now();
    const time = currentTimeRef.current;

    void (async () => {
      const { error } = await updateSalonState({ video_status: playing ? 'playing' : 'paused', video_time: time });
      if (error) {
        console.error("Erreur update playback state", error);
      }
    })();

    if (!roomChannelRef.current) return;
    if (lastPlaybackBroadcastStateRef.current === playing && now - lastSeekBroadcastAtRef.current < 700) {
      return;
    }
    lastPlaybackBroadcastStateRef.current = playing;

    if (roomChannelRef.current) {
      void (async () => {
        try {
          await roomChannelRef.current.send({
            type: 'broadcast',
            event: 'room_force_sync',
            payload: {
              by: currentUser.id,
              at: now,
              time,
              isPlaying: playing,
              forceSeek: true,
              forceReload: false,
            }
          });
        } catch (error: any) {
          console.error("Erreur broadcast playback state", error);
        }
      })();
    }
  }, [backendSalonId, canControlVideo, currentUser.id, updateSalonState]);

  const handleAssignRegie = async (participantId: string, enabled: boolean) => {
    try {
      await setParticipantRole(backendSalonId || roomId, participantId, enabled ? "regie" : "member");
      const regiePermissions = normalizePermissions(enabled ? "regie" : "member", null);
      await setParticipantPermissionsApi(backendSalonId || roomId, participantId, regiePermissions);
      // Optimistic update in local state
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.id === participantId
            ? { ...participant, role: enabled ? "regie" : "member" }
            : participant
        )
      );
      setParticipantPermissionsMap((prev) => ({
        ...prev,
        [participantId]: regiePermissions,
      }));
      // Immediately reload from DB so the promoted user's client also gets their new role
      await loadParticipantsSnapshot();
      const participant = participants.find((item) => item.id === participantId);
      void broadcastRegieAction(
        "assign_regie",
        enabled ? "Role regie attribue" : "Role regie retire",
        participant?.name || participantId
      );
      toast.success(enabled ? "🎬 Rôle Régie vidéo attribué" : "Rôle Régie vidéo retiré");
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Impossible de mettre a jour le role"));
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
              {effectiveRole === null ? "..." : effectiveRole === "admin" ? "Admin" : effectiveRole === "regie" ? "Regie" : "Invite"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManagePlaylist && (
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
            disabled={!canControlVideo}
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
            disabled={!canControlVideo}
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

      {isSessionRestricted && (
        <div className="px-4 pt-4">
          <div
            className={`rounded-xl border px-4 py-3 ${
              theme === "dark" ? "border-zinc-800 bg-zinc-900" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-red-600 text-white hover:bg-red-600">Session controlee</Badge>
              {sessionLockState.roomLocked && (
                <span className={`inline-flex items-center gap-1 text-sm ${theme === "dark" ? "text-amber-300" : "text-amber-700"}`}>
                  <Lock className="w-4 h-4" />
                  Salle verrouillee
                </span>
              )}
              {sessionLockState.chatDisabled && (
                <span className={`inline-flex items-center gap-1 text-sm ${theme === "dark" ? "text-red-300" : "text-red-700"}`}>
                  <MessageCircle className="w-4 h-4" />
                  Chat desactive
                </span>
              )}
              {sessionLockState.focusMode && (
                <span className={`inline-flex items-center gap-1 text-sm ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}>
                  <EyeOff className="w-4 h-4" />
                  Mode focus actif
                </span>
              )}
              {sessionLockState.updatedBy && (
                <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                  Maj par {sessionLockState.updatedBy}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

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
              canControl={canControlVideo}
              syncTime={currentTime}
              syncNonce={syncNonce}
              onTimeUpdate={handlePlayerTimeUpdate}
              onPlaybackStateChange={handleAdminPlaybackStateChange}
              theme={theme}
            />
          ) : (
            <div className={`relative ${theme === 'dark' ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-200 to-gray-300'} rounded-xl overflow-hidden aspect-video flex items-center justify-center`}>
              <Badge className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1">
                En direct
              </Badge>

              <button
                onClick={handlePlayPause}
                disabled={!canControlVideo}
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

          {currentVideo && (
            <div className={`${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'} rounded-xl p-4`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-sm font-semibold flex items-center gap-2`}>
                    <BookmarkPlus className="w-4 h-4 text-red-500" />
                    Marque-pages
                  </h2>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1 text-xs`}>
                    Reperez les moments importants de la video en cours
                  </p>
                </div>

                {canControlVideo && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setShowBookmarkDialog(true)}
                    className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs"
                  >
                    <BookmarkPlus className="w-3 h-3 mr-1.5" />
                    Ajouter
                  </Button>
                )}
              </div>

              {currentVideoBookmarks.length === 0 ? (
                <div className={`mt-4 rounded-xl border px-4 py-5 text-sm ${
                  theme === "dark" ? "border-zinc-800 bg-zinc-950/60 text-gray-400" : "border-gray-200 bg-white text-gray-600"
                }`}>
                  Aucun marque-page sur cette video pour l'instant.
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {currentVideoBookmarks.map((bookmark) => (
                    <button
                      key={bookmark.id}
                      type="button"
                      onClick={() => handleSeekToBookmark(bookmark)}
                      disabled={!canControlVideo}
                      className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                        theme === "dark"
                          ? "border-zinc-800 bg-zinc-950/70 hover:bg-zinc-800 text-white"
                          : "border-gray-200 bg-white hover:bg-gray-50 text-black"
                      } disabled:cursor-default disabled:hover:bg-inherit disabled:opacity-90`}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <Clock3 className="w-3.5 h-3.5 text-amber-400" />
                        <span className={theme === "dark" ? "text-amber-300" : "text-amber-700"}>
                          {formatVideoTimeLabel(bookmark.time)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium">{bookmark.label}</p>
                      <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1 text-[11px]`}>
                        {bookmark.byName} • {bookmark.createdAt}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {!canControlVideo && currentVideoBookmarks.length > 0 && (
                <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-3 text-xs`}>
                  Seule la regie peut relancer la lecture depuis un marque-page.
                </p>
              )}
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
                      if (canControlVideo) {
                        handlePlayVideo(video);
                      }
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
              onClick={() => {
                if (!canUsePolls) {
                  toast.error("Les sondages sont désactivés pour vous");
                  return;
                }
                setActiveTab("polls");
              }}
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
                {sessionLockState.focusMode && !canControlVideo && (
                  <div className={`rounded-xl border px-4 py-4 ${
                    theme === "dark" ? "border-blue-900/40 bg-blue-950/20" : "border-blue-200 bg-blue-50"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${
                        theme === "dark" ? "bg-blue-500/15 text-blue-300" : "bg-blue-100 text-blue-700"
                      }`}>
                        <EyeOff className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>
                          Mode focus active
                        </p>
                        <p className={`mt-1 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                          La regie masque temporairement le chat pour recentrer la session sur la video.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                                disabled={isChatBlockedForViewer}
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
                              disabled={isChatBlockedForViewer}
                              className="hover:scale-125 transition-transform text-sm disabled:opacity-40 disabled:hover:scale-100"
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
                      disabled={!canSendChat}
                      className="text-lg hover:scale-125 transition-transform disabled:opacity-40 disabled:hover:scale-100"
                    >
                      {reaction}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-4 border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-300'}`}>
                {isChatBlockedForViewer && (
                  <div className={`mb-3 rounded-lg border px-3 py-2 text-sm ${
                    theme === "dark" ? "border-zinc-800 bg-zinc-800/70 text-gray-300" : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}>
                    {sessionLockState.focusMode
                      ? "Le chat est masque pendant le mode focus."
                      : "Le chat est temporairement desactive par la regie."}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    autoComplete="off"
                    placeholder={
                      !canUseChat
                        ? "Chat desactive"
                        : sessionLockState.focusMode && !canControlVideo
                          ? "Chat masque pendant le mode focus"
                          : sessionLockState.chatDisabled && !canControlVideo
                            ? "Chat desactive par la regie"
                            : "Message..."
                    }
                    disabled={!canSendChat}
                    className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-black placeholder:text-gray-400'} flex-1 text-sm h-9`}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!canSendChat}
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
                          {getRoleLabel(effectiveRole)}
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
                              {participant.role === "regie" && <Clapperboard className="w-3 h-3 text-red-400" />}
                            </p>
                            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                              {getRoleLabel(participant.role)}
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
          {activeTab === "polls" && backendSalonId && canUsePolls && (
            <div className="flex-1 overflow-hidden h-full">
              <PollSection
                salonId={backendSalonId}
                isAdmin={isAdmin}
                currentUser={currentUser.name}
              />
            </div>
          )}
          {activeTab === "polls" && !canUsePolls && (
            <div className={`flex-1 p-4 ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
              Les sondages sont désactivés pour votre compte.
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
                    setShowRegieHistory(true);
                    setShowMenu(false);
                  }}
                  variant="ghost"
                  className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
                >
                  <History className="w-4 h-4 mr-2" />
                  Historique regie
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

            {!isAdmin && canManagePlaylist && (
              <>
                <div className={`border-t my-1 ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-300'}`}></div>
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

            {canControlVideo && (
              <>
                <Button
                  onClick={() => {
                    setShowBookmarkDialog(true);
                    setShowMenu(false);
                  }}
                  variant="ghost"
                  className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
                >
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  Ajouter un marque-page
                </Button>

                <Button
                  onClick={() => {
                    setShowSessionLockPanel(true);
                    setShowMenu(false);
                  }}
                  variant="ghost"
                  className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Verrouillage session
                </Button>

                <Button
                  onClick={() => {
                    setShowAnnouncementDialog(true);
                    setShowMenu(false);
                  }}
                  variant="ghost"
                  className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
                >
                  <Megaphone className="w-4 h-4 mr-2" />
                  Envoyer une annonce
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
              avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23DC2626'/%3E%3Ccircle cx='100' cy='80' r='35' fill='white' opacity='0.9'/%3E%3Cellipse cx='100' cy='160' rx='55' ry='40' fill='white' opacity='0.9'/%3E%3C/svg%3E",
              permissions: normalizePermissions(effectiveRole, selfParticipant?.id ? participantPermissions[selfParticipant.id] : undefined),
            },
            ...otherParticipants.map((participant) => ({
              ...participant,
              permissions: participantPermissions[participant.id] || normalizePermissions(participant.role, null),
            }))
          ]}
          onClose={() => setShowPermissions(false)}
          onUpdatePermissions={handleUpdatePermissions}
          onAssignRegie={handleAssignRegie}
          theme={theme}
          isReadOnly={false}
        />
      )}

      {showVideoManagement && canManagePlaylist && (
        <VideoManagementPanel
          videos={playlist}
          onClose={() => setShowVideoManagement(false)}
          onAddVideo={handleAddVideo}
          onAddVideosBatch={handleAddVideosBatch}
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

      {showRegieHistory && isAdmin && (
        <RegieActionHistoryPanel
          history={regieActionHistory}
          onClose={() => setShowRegieHistory(false)}
          theme={theme}
        />
      )}

      {showAnnouncementDialog && (
        <RegieAnnouncementDialog
          isOpen={showAnnouncementDialog}
          onClose={() => setShowAnnouncementDialog(false)}
          onSubmit={handleSendAnnouncement}
          theme={theme}
        />
      )}

      {showBookmarkDialog && canControlVideo && (
        <VideoBookmarkDialog
          isOpen={showBookmarkDialog}
          currentTime={currentTimeRef.current}
          currentVideoTitle={currentVideo?.title}
          onClose={() => setShowBookmarkDialog(false)}
          onSubmit={handleAddBookmark}
          theme={theme}
        />
      )}

      {showSessionLockPanel && canControlVideo && (
        <SessionLockPanel
          isOpen={showSessionLockPanel}
          value={sessionLockState}
          onClose={() => setShowSessionLockPanel(false)}
          onApply={handleApplySessionLock}
          theme={theme}
        />
      )}
    </div>
  );
}


