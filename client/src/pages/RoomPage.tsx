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
 *  - La persistance des données (messages, playlist) via localStorage
 *  - Les modes clair et sombre
 *
 * Utilisé dans routes/AppRouter.tsx via RoomPageWrapper.
 */

import { useState, useEffect, useRef } from "react";
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
import { saveRoomData, loadRoomData } from "../utils/roomStorage";
import { getRoomById, incrementParticipants, decrementParticipants } from "../utils/storage";
import { extractYouTubeId, getYouTubeThumbnail } from "../utils/youtubeUtils";
import { toast } from "sonner";
import { echo } from "../echo";

// Placeholders d'images locales (SVG inline)
const AVATAR_USER_1 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Ccircle cx='100' cy='100' r='100' fill='%238B5CF6'/%3E%3Ccircle cx='100' cy='80' r='35' fill='white' opacity='0.9'/%3E%3Cellipse cx='100' cy='160' rx='55' ry='40' fill='white' opacity='0.9'/%3E%3C/svg%3E";
const AVATAR_USER_2 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Ccircle cx='100' cy='100' r='100' fill='%2310B981'/%3E%3Ccircle cx='100' cy='80' r='35' fill='white' opacity='0.9'/%3E%3Cellipse cx='100' cy='160' rx='55' ry='40' fill='white' opacity='0.9'/%3E%3C/svg%3E";
const AVATAR_USER_3 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23F59E0B'/%3E%3Ccircle cx='100' cy='80' r='35' fill='white' opacity='0.9'/%3E%3Cellipse cx='100' cy='160' rx='55' ry='40' fill='white' opacity='0.9'/%3E%3C/svg%3E";

const THUMBNAIL_MOVIE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 225' fill='none'%3E%3Crect width='400' height='225' fill='%231F2937'/%3E%3Crect x='30' y='40' width='340' height='145' rx='8' fill='%23374151'/%3E%3Cpath d='M160 100 L160 170 L220 135 Z' fill='%23DC2626'/%3E%3C/svg%3E";
const THUMBNAIL_MUSIC = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 225' fill='none'%3E%3Crect width='400' height='225' fill='%23831843'/%3E%3Ccircle cx='120' cy='140' r='30' fill='%23DB2777'/%3E%3Ccircle cx='280' cy='140' r='30' fill='%23DB2777'/%3E%3Crect x='110' y='60' width='20' height='80' fill='%23F9A8D4'/%3E%3Crect x='270' y='80' width='20' height='60' fill='%23F9A8D4'/%3E%3C/svg%3E";

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

const mockParticipants: Participant[] = [
  { 
    id: "2", 
    name: "MovieFan", 
    role: "member", 
    status: "online", 
    avatar: AVATAR_USER_1
  },
  { 
    id: "3", 
    name: "Sarah", 
    role: "member", 
    status: "online", 
    avatar: AVATAR_USER_2
  },
  { 
    id: "4", 
    name: "Lucas", 
    role: "member", 
    status: "online", 
    avatar: AVATAR_USER_3
  },
];

const initialMessages: Message[] = [
  { 
    id: "1", 
    sender: "Vous", 
    senderId: "current",
    content: "test", 
    timestamp: "21:47", 
    isYou: true,
    reactions: []
  },
  { 
    id: "2", 
    sender: "Vous", 
    senderId: "current",
    content: "!!!!", 
    timestamp: "21:47", 
    isYou: true,
    reactions: []
  },
  { 
    id: "3", 
    sender: "Vous", 
    senderId: "current",
    content: "😂", 
    timestamp: "21:47", 
    isYou: true,
    reactions: []
  },
];

const mockPlaylist: VideoInPlaylist[] = [
  { 
    id: "1", 
    youtubeId: "dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up", 
    thumbnail: THUMBNAIL_MOVIE, 
    duration: "3:33",
    isCurrent: true,
    votes: 0,
    isFavorite: false
  },
  { 
    id: "2", 
    youtubeId: "kXYiU_JCYtU",
    title: "Coldplay - Viva La Vida", 
    thumbnail: THUMBNAIL_MUSIC, 
    duration: "4:04",
    votes: 0,
    isFavorite: false
  },
  { 
    id: "3", 
    youtubeId: "CevxZvSJLk8",
    title: "Katy Perry - Roar", 
    thumbnail: THUMBNAIL_MUSIC, 
    duration: "4:23",
    votes: 0,
    isFavorite: false
  },
  { 
    id: "4", 
    youtubeId: "09R8_2nJtjg",
    title: "Maroon 5 - Sugar", 
    thumbnail: THUMBNAIL_MUSIC, 
    duration: "3:55",
    votes: 0,
    isFavorite: false
  },
  { 
    id: "5", 
    youtubeId: "fRh_vgS2dFE",
    title: "Justin Timberlake - Can't Stop The Feeling", 
    thumbnail: THUMBNAIL_MUSIC, 
    duration: "4:46",
    votes: 0,
    isFavorite: false
  },
  { 
    id: "6", 
    youtubeId: "YQHsXMglC9A",
    title: "Adele - Hello", 
    thumbnail: THUMBNAIL_MUSIC, 
    duration: "6:07",
    votes: 0,
    isFavorite: false
  },
];

const reactions = ["❤️", "😂", "👍", "🔥", "😮", "🎉"];

export function RoomPage({ roomId, roomName, roomCreator, currentUser, onNavigate, theme = "dark", onThemeToggle }: RoomPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
 const [activeTab, setActiveTab] = useState<"chat" | "participants" | "polls">("chat");
  const [backendSalonId, setBackendSalonId] = useState<string>("");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [playlist, setPlaylist] = useState<VideoInPlaylist[]>(mockPlaylist);
  const [videoHistory, setVideoHistory] = useState<VideoHistoryEntry[]>([]);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showVideoVote, setShowVideoVote] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showVideoManagement, setShowVideoManagement] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [roomCode, setRoomCode] = useState<string>("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = roomCreator ? currentUser.email === roomCreator : false;
  
  // Filtrer les participants pour éviter que l'admin soit dans la liste
  const otherParticipants = participants.filter(p => 
    p.id !== currentUser.id && 
    p.id !== currentUser.email &&
    p.name !== currentUser.name
  );
  
  const participantCount = otherParticipants.filter(p => p.status === "online").length + 1; // +1 pour l'utilisateur courant
  const currentVideo = playlist.find(v => v.isCurrent);

  // Charger le code du salon
  useEffect(() => {
    const room = getRoomById(roomId);
    if (room) {
      setRoomCode(room.joinCode);
    }
  }, [roomId]);
 // Récupérer l'ID technique du salon pour les sondages
  useEffect(() => {
    if (roomCode) {
      const fetchSalonId = async () => {
        try {
          const token = localStorage.getItem('token');
          // On met l'URL en dur pour éviter ton erreur 'env'
          const response = await fetch(`http://localhost:8000/api/salons/${roomCode}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setBackendSalonId(data.id);
          }
        } catch (error) {
          console.error("Erreur ID salon", error);
        }
      };
      fetchSalonId();
    }
  }, [roomCode]);
  // Charger la vidéo initiale du salon créé
  useEffect(() => {
    const room = getRoomById(roomId);
    if (room && room.videoUrl) {
      const youtubeId = extractYouTubeId(room.videoUrl);
      if (youtubeId) {
        const initialVideo: VideoInPlaylist = {
          id: 'initial-' + Date.now(),
          youtubeId: youtubeId,
          title: 'Vidéo initiale du salon',
          thumbnail: getYouTubeThumbnail(youtubeId),
          duration: '0:00',
          isCurrent: true,
          votes: 0,
          isFavorite: false
        };
        
        // Vérifier si cette vidéo n'est pas déjà dans la playlist
        setPlaylist(prev => {
          const hasInitialVideo = prev.some(v => v.youtubeId === youtubeId);
          if (!hasInitialVideo) {
            console.log('📹 Vidéo initiale chargée:', youtubeId);
            return [initialVideo, ...prev.map(v => ({ ...v, isCurrent: false }))];
          }
          return prev;
        });
      }
    }
  }, [roomId]);

  // Gérer les participants (incrémenter à l'entrée, décrémenter à la sortie)
  useEffect(() => {
    incrementParticipants(roomId);
    console.log('👋 Participant rejoint le salon');
    
    // Cleanup: décrémenter quand on quitte le composant
    return () => {
      decrementParticipants(roomId);
      console.log('👋 Participant quitté');
    };
  }, [roomId]);

// Connexion Echo pour la synchro temps réel
useEffect(() => {
  const channel = echo.channel(`salon.${roomId}`);
  
  channel.listen('VideoUpdated', (data: any) => {
    console.log('📡 Événement reçu:', data);
    
    if (data.action === 'play') {
      setIsPlaying(true);
      toast.info(`${data.userName || 'Un participant'} a lancé la vidéo`);
    } else if (data.action === 'pause') {
      setIsPlaying(false);
      toast.info(`${data.userName || 'Un participant'} a mis en pause`);
    } else if (data.action === 'change' && data.videoId) {
      setPlaylist((prev) =>
        prev.map((v) => ({
          ...v,
          isCurrent: v.youtubeId === data.videoId,
        }))
      );
      toast.info(`${data.userName || 'Un participant'} a changé de vidéo`);
    }
  });

  console.log(`📡 Connecté au canal salon.${roomId}`);

  return () => {
    echo.leave(`salon.${roomId}`);
    console.log(`📡 Déconnecté du canal salon.${roomId}`);
  };
}, [roomId]);

  // Charger les données sauvegardées au montage du composant
  useEffect(() => {
    try {
      const savedData = loadRoomData(roomId);
      if (savedData) {
        setMessages(savedData.messages);
        // Ne pas écraser la playlist si on a déjà chargé la vidéo initiale
        setPlaylist(prev => prev.length > mockPlaylist.length ? prev : savedData.playlist);
        console.log('Données du salon restaurées');
      }
      
      // Charger l'historique des vidéos
      const savedHistory = localStorage.getItem(`room_${roomId}_videoHistory`);
      if (savedHistory) {
        setVideoHistory(JSON.parse(savedHistory));
        console.log('Historique des vidéos chargé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, [roomId]);

  // Sauvegarder automatiquement à chaque changement
  useEffect(() => {
    try {
      saveRoomData(roomId, messages, playlist);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }
  }, [roomId, messages, playlist]);

  // Sauvegarder l'historique des vidéos
  useEffect(() => {
    try {
      localStorage.setItem(`room_${roomId}_videoHistory`, JSON.stringify(videoHistory));
      console.log('Historique des vidéos sauvegardé:', videoHistory.length, 'entrées');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique:', error);
    }
  }, [roomId, videoHistory]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      sender: "Vous",
      senderId: "current",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      isYou: true,
      reactions: []
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
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
  
  const action = newPlayingState ? 'play' : 'pause';
  console.log('🎬 handlePlayPause appelé, action:', action, 'roomId:', roomId);

  // Broadcaster l'événement via API
  try {
    const API_URL = 'http://localhost:8000';
    const token = localStorage.getItem('token');
    
    await fetch(`${API_URL}/api/salons/${roomId}/video-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        action,
        userName: currentUser.name,
      }),
    });
  } catch (err) {
    console.error('Erreur broadcast:', err);
  }
  
  toast.success(
    newPlayingState 
      ? `${currentUser.name} a lancé la vidéo` 
      : `${currentUser.name} a mis en pause`,
    { icon: newPlayingState ? '▶️' : '⏸️' }
  );
};

  const handleToggleFavorite = (videoId: string) => {
    setPlaylist(prev => prev.map(v => 
      v.id === videoId ? { ...v, isFavorite: !v.isFavorite } : v
    ));
  };

  const handleLeaveRoom = () => {
    console.log('Opening leave dialog');
    setShowLeaveDialog(true);
  };

  const confirmLeave = () => {
    console.log('Leaving room and redirecting to salons...');
    setShowLeaveDialog(false);
    // Rediriger vers la page "salons" (liste des salons)
    onNavigate("salons");
  };

  const cancelLeave = () => {
    console.log('Cancelled leaving room');
    setShowLeaveDialog(false);
  };

  const handleSync = () => {
    console.log('Syncing video...');
    toast.success('🔄 Synchronisation effectuée');
  };

  const handleAddVideo = (url: string, title: string, youtubeId?: string) => {
    console.log('Adding video:', { url, title, youtubeId });
    const newVideo: VideoInPlaylist = {
      id: Date.now().toString(),
      youtubeId: youtubeId,
      title: title,
      thumbnail: youtubeId 
        ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
        : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
      duration: "0:00",
      isCurrent: false,
      votes: 0,
      isFavorite: false
    };
    
    setPlaylist([...playlist, newVideo]);
    toast.success(`✅ Vidéo "${title}" ajoutée à la playlist !`);
    
    if (youtubeId) {
      setTimeout(() => {
        handlePlayVideo(newVideo);
        toast.info('▶️ Lecture de la nouvelle vidéo...');
      }, 100);
    }
  };

  const handleRemoveVideo = (videoId: string) => {
    const videoToRemove = playlist.find(v => v.id === videoId);
    console.log('Removing video:', videoId);
    setPlaylist(prev => prev.filter(v => v.id !== videoId));
    if (videoToRemove) {
      toast.success(`🗑️ Vidéo "${videoToRemove.title}" supprimée`);
    }
  };

  const handleUpdatePermissions = (updatedParticipants: Participant[]) => {
    setParticipants(updatedParticipants);
  };

  const handlePlayVideo = (video: VideoInPlaylist) => {
    // Notification : Changement de vidéo
    toast.success(`Lecture de "${video.title}"`, {
      duration: 3000,
      icon: '🎬',
      description: `Lancée par ${currentUser.name}`,
    });
    
    // Mettre à jour la playlist
    setPlaylist(prev => prev.map(v => 
      v.id === video.id ? { ...v, isCurrent: true } : { ...v, isCurrent: false }
    ));
    
    // Ajouter à l'historique
    const historyEntry: VideoHistoryEntry = {
      id: Date.now().toString(),
      youtubeId: video.youtubeId,
      title: video.title,
      thumbnail: video.thumbnail,
      duration: video.duration,
      playedAt: new Date().toLocaleString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      playedBy: currentUser.name
    };
    
    setVideoHistory(prev => [historyEntry, ...prev]);
    console.log('📹 Vidéo ajoutée à l\'historique:', video.title);
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
              {isAdmin ? 'Admin' : 'Invité'}
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
                console.log('Clicked: Add Video');
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
              console.log('Toggle Play/Pause - Current state:', isPlaying);
              setIsPlaying(!isPlaying);
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
              console.log('Syncing video...');
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
              console.log('Opening leave dialog');
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
                      if (isAdmin) {
                        handlePlayVideo(video);
                      }
                    }}
                    className={`relative group rounded-lg overflow-hidden ${ 
                      video.isCurrent ? "ring-2 ring-red-600" : ""
                    } ${isAdmin ? 'cursor-pointer hover:ring-2 hover:ring-red-400' : 'cursor-default'} transition-all`}
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                    />
                    
                    {isAdmin && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    )}

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
              className={`flex-1 px-4 py-3 text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === "chat"
                  ? "bg-red-600 text-white"
                  : theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`flex-1 px-4 py-3 text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === "participants"
                  ? "bg-red-600 text-white"
                  : theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
              }`}
            >
              <Users className="w-4 h-4" />
              Participants ({participantCount})
            </button><button
            onClick={() => setActiveTab("polls")}
            className={`flex-1 px-4 py-3 text-sm transition-colors flex items-center justify-center gap-2 ${
              activeTab === "polls"
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
                        className={`${
                          message.isYou 
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
                          {isAdmin ? "Administrateur" : "Invité"}
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
                      <div className={`w-2 h-2 rounded-full ${
                        participant.status === "online" ? "bg-green-500" : "bg-gray-500"
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
                console.log('Opening Share Dialog');
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
                console.log('Opening Room Info Panel');
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
                console.log('Opening Video Vote Panel');
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
                console.log('Opening Rating Panel');
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
                console.log('Opening History Panel');
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
                    console.log('Opening Permissions Panel');
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
                    console.log('Opening Video Management Panel');
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
                console.log('Opening Leave Dialog');
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
          videos={playlist.filter(v => !v.isCurrent).map(v => ({
            id: v.id,
            title: v.title,
            thumbnail: v.thumbnail,
            votes: v.votes || 0
          }))}
          onClose={() => setShowVideoVote(false)}
          onVote={(videoId: string) => console.log('Vote for:', videoId)}
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
            ...participants
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