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

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Logo } from "../components/ui/Logo";
import { 
  Play, 
  Pause,
  RotateCcw,
  LogOut,
  Video,
  Heart,
  ThumbsUp,
  Smile,
  MessageCircle,
  Users,
  Plus,
  Send,
  Menu,
  Info,
  Crown,
  BarChart3,
  Sun,
  Moon,
  Shield
} from "lucide-react";
import { LeaveRoomDialog } from "./LeaveRoomDialog";
import { RoomInfoPanel } from "../components/room/RoomInfoPanel";
import { RoomRatingPanel } from "../components/room/RoomRatingPanel";
import { VideoVotePanel } from "../components/room/VideoVotePanel";
import { ParticipantsPermissionsPanel } from "../components/room/ParticipantsPermissionsPanel";
import { VideoManagementPanel } from "../components/room/VideoManagementPanel";
import { YouTubePlayer } from "../components/room/YouTubePlayer";
import { EmptyState } from "../components/room/EmptyStates";
import { saveRoomData, loadRoomData } from "../utils/roomStorage";
import { toast } from "sonner";

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

const topAdmins = [
  { name: "CinePhile", rating: 4.95, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100", rank: 1 },
  { name: "GamerPro", rating: 4.85, avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100", rank: 2 },
  { name: "MusicFan", rating: 4.76, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", rank: 3 },
];

export function RoomPage({ roomId, roomName, roomCreator, currentUser, onNavigate, theme = "dark", onThemeToggle }: RoomPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [playlist, setPlaylist] = useState<VideoInPlaylist[]>(mockPlaylist);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showVideoVote, setShowVideoVote] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showVideoManagement, setShowVideoManagement] = useState(false);

  const isAdmin = roomCreator ? currentUser.email === roomCreator : false;
  const participantCount = participants.filter(p => p.status === "online").length + 1;
  const currentVideo = playlist.find(v => v.isCurrent);

  // Charger les données sauvegardées au montage du composant
  useEffect(() => {
    try {
      const savedData = loadRoomData(roomId);
      if (savedData) {
        setMessages(savedData.messages);
        setPlaylist(savedData.playlist);
        toast.success('Données du salon restaurées ! 📂');
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

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleToggleFavorite = (videoId: string) => {
    setPlaylist(prev => prev.map(v => 
      v.id === videoId ? { ...v, isFavorite: !v.isFavorite } : v
    ));
  };

  const handleLeaveRoom = () => {
    setShowLeaveDialog(true);
  };

  const confirmLeave = () => {
    setTimeout(() => onNavigate("salons"), 300);
  };

  const handleAddVideo = (url: string, title: string, youtubeId?: string) => {
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
    
    // Ajouter la vidéo à la playlist
    setPlaylist([...playlist, newVideo]);
    
    // Lancer automatiquement la vidéo ajoutée
    if (youtubeId) {
      setTimeout(() => {
        handlePlayVideo(newVideo);
      }, 100);
    }
  };

  const handleRemoveVideo = (videoId: string) => {
    setPlaylist(prev => prev.filter(v => v.id !== videoId));
  };

  const handleUpdatePermissions = (updatedParticipants: Participant[]) => {
    setParticipants(updatedParticipants);
  };

  const handlePlayVideo = (video: VideoInPlaylist) => {
    setPlaylist(prev => prev.map(v => 
      v.id === video.id ? { ...v, isCurrent: true } : { ...v, isCurrent: false }
    ));
  };

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-black' : 'bg-white'} overflow-hidden`}>
      {/* Header - Responsive */}
      <header className={`${theme === 'dark' ? 'bg-black border-zinc-800' : 'bg-white border-gray-200'} border-b px-3 md:px-6 py-3 flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-2 md:gap-6 min-w-0 flex-1">
          <Logo size="sm" theme={theme} showText={false} className="shrink-0" />

          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <h1 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-sm md:text-base font-semibold truncate`}>
              {roomName}
            </h1>
            
            <div className="hidden sm:flex items-center gap-2">
              <Users className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                {participantCount}
              </span>
            </div>
            
            <Badge className="bg-red-600 text-white hover:bg-red-600 px-2 md:px-3 py-1 flex items-center gap-1 text-xs shrink-0">
              <Crown className="w-3 h-3" />
              <span className="hidden sm:inline">{isAdmin ? 'Admin' : 'Invité'}</span>
            </Badge>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center gap-2">
          {isAdmin && (
            <Button
              onClick={() => setShowVideoManagement(true)}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs"
            >
              <Plus className="w-3 h-3 mr-1.5" />
              Ajouter
            </Button>
          )}
          
          <Button
            onClick={handlePlayPause}
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
            variant="ghost"
            size="sm"
            className={`${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-zinc-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'} text-sm h-9`}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Sync
          </Button>

          {onThemeToggle && (
            <Button
              onClick={onThemeToggle}
              variant="ghost"
              size="sm"
              className={`${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-zinc-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'} h-9 px-3`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          )}

          <Button
            onClick={handleLeaveRoom}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-100/10 text-sm h-9"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Quitter
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          onClick={() => setShowMenu(!showMenu)}
          variant="ghost"
          size="sm"
          className={`lg:hidden ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} h-9 px-2`}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content - Responsive Layout */}
      <div className="flex flex-col lg:flex-row flex-1 gap-2 md:gap-4 p-2 md:p-4 overflow-hidden">
        {/* Left Column: Video + Playlist */}
        <div className="flex-1 flex flex-col gap-2 md:gap-4 overflow-hidden min-h-0">
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

          <div className={`flex-1 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'} rounded-xl p-4 overflow-hidden flex flex-col`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-sm flex items-center gap-2`}>
                <Menu className="w-4 h-4" />
                PLAYLIST ({playlist.length})
              </h2>
              {isAdmin && (
                <Button
                  onClick={() => setShowVideoManagement(true)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1.5" />
                  Ajouter
                </Button>
              )}
            </div>

            {playlist.length === 0 ? (
              <EmptyState type="videos" theme={theme} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto">
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
                        <div className="flex flex-col items-center gap-2">
                          <Play className="w-8 h-8 text-white" />
                          <span className="text-white text-xs font-medium">Lire maintenant</span>
                        </div>
                      </div>
                    )}

                    {video.isCurrent && (
                      <div className="absolute top-2 left-2 bg-red-600 rounded p-1">
                        <Play className="w-2.5 h-2.5 text-white fill-white" />
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(video.id);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <Heart className={`w-3.5 h-3.5 ${video.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <p className="text-white text-xs truncate">{video.title}</p>
                      <p className="text-gray-400 text-xs">{video.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat + Participants */}
        <div className={`w-full lg:w-80 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'} rounded-xl flex flex-col overflow-hidden lg:shrink-0 max-h-[50vh] lg:max-h-none`}>
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
            </button>
          </div>

          {activeTab === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
              </div>

              <div className={`px-4 py-3 border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-300'}`}>
                <div className="flex items-center gap-2 justify-between">
                  {reactions.map((reaction, index) => (
                    <button
                      key={index}
                      onClick={() => handleReactionClick(reaction)}
                      className="text-xl hover:scale-125 transition-transform"
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

                {participants.map((participant) => (
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
        </div>
      </div>

      {/* Floating Menu Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40 ${
          theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="fixed bottom-24 right-4 left-4 lg:left-auto lg:right-8 lg:w-auto flex flex-col gap-3 z-50">
          {/* Mobile Controls */}
          <div className="lg:hidden flex flex-col gap-2">
            <Button
              onClick={() => {
                handlePlayPause();
                setShowMenu(false);
              }}
              className="bg-zinc-700 hover:bg-zinc-600 text-white justify-start"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Lecture
                </>
              )}
            </Button>
            
            {onThemeToggle && (
              <Button
                onClick={() => {
                  onThemeToggle();
                  setShowMenu(false);
                }}
                variant="ghost"
                className={`justify-start ${theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4 mr-2" />
                    Mode clair
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    Mode sombre
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={() => {
                handleLeaveRoom();
                setShowMenu(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Quitter le salon
            </Button>

            <div className={`border-t ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-300'} my-2`} />
          </div>

          {/* Action Buttons */}
          <div className="flex lg:flex-col gap-3">
            <button
              onClick={() => {
                setShowRoomInfo(true);
                setShowMenu(false);
              }}
              className="flex-1 lg:w-12 lg:h-12 h-10 bg-gray-700 hover:bg-gray-600 rounded-full shadow-lg flex items-center justify-center lg:justify-center transition-all hover:scale-110"
              title="Informations"
            >
              <Info className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => {
                setShowVideoVote(true);
                setShowMenu(false);
              }}
              className="flex-1 lg:w-12 lg:h-12 h-10 bg-yellow-600 hover:bg-yellow-700 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
              title="Vote vidéo"
            >
              <ThumbsUp className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => {
                setShowRating(true);
                setShowMenu(false);
              }}
              className="flex-1 lg:w-12 lg:h-12 h-10 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
              title="Noter le salon"
            >
              <BarChart3 className="w-5 h-5 text-white" />
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setShowPermissions(true);
                  setShowMenu(false);
                }}
                className="flex-1 lg:w-12 lg:h-12 h-10 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                title="Gérer les permissions"
              >
                <Shield className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Panels */}
      {showRoomInfo && (
        <RoomInfoPanel
          onClose={() => setShowRoomInfo(false)}
          roomData={{
            name: roomName,
            admin: isAdmin ? currentUser.name : (roomCreator || currentUser.name),
            isCurrentUserAdmin: isAdmin,
            type: "Public",
            participants: participantCount,
            maxParticipants: 20,
          }}
        />
      )}

      {showRating && (
        <RoomRatingPanel
          onClose={() => setShowRating(false)}
          topAdmins={topAdmins}
          roomId={roomId}
        />
      )}

      {showVideoVote && (
        <VideoVotePanel
          onClose={() => setShowVideoVote(false)}
          videos={playlist}
        />
      )}

      {showPermissions && (
        <ParticipantsPermissionsPanel
          onClose={() => setShowPermissions(false)}
          participants={participants}
          onUpdateParticipants={handleUpdatePermissions}
          theme={theme}
        />
      )}

      {showVideoManagement && (
        <VideoManagementPanel
          onClose={() => setShowVideoManagement(false)}
          videos={playlist}
          onAddVideo={handleAddVideo}
          onRemoveVideo={handleRemoveVideo}
          theme={theme}
        />
      )}

      <LeaveRoomDialog
        open={showLeaveDialog}
        onConfirm={confirmLeave}
        onCancel={() => setShowLeaveDialog(false)}
      />
    </div>
  );
}