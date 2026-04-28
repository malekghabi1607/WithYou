/**
 * Projet : WithYou
 * Fichier : pages/RoomPage.tsx
 *
 * Description :
 * Page principale du salon de visionnage collaboratif.
 * Interface complÃ¨te pour regarder des vidÃ©os ensemble en temps rÃ©el.
 * GÃ¨re :
 *  - Le lecteur vidÃ©o YouTube avec synchronisation
 *  - Le chat en direct avec rÃ©actions et Ã©mojis
 *  - La liste des participants avec statuts en ligne/hors-ligne
 *  - La playlist vidÃ©o avec votes et favoris
 *  - Les contrÃ´les admin (ajouter/supprimer vidÃ©os, gÃ©rer permissions)
 *  - Les panneaux d'informations et de notation
 *  - La persistance des donnÃ©es (messages, playlist) via backend
 *  - Les modes clair et sombre
 *
 * UtilisÃ© dans routes/AppRouter.tsx via RoomPageWrapper.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/Input";
import { Logo } from "../components/ui/Logo";
import { PollSection } from "../components/room/PollSection";
import { SceneSwitcher, type SceneMode } from "../components/room/SceneSwitcher";
import { InterludeScreen } from "../components/room/InterludeScreen";
import { AIVideoPreviewPanel } from "../components/room/AIVideoPreviewPanel";
import { AIDiscussionQuestions } from "../components/room/AIDiscussionQuestions";
import { LiveTranscriptionOverlay } from "../components/room/LiveTranscriptionOverlay";
import { RoomContentPanel } from "../components/room/RoomContentPanel";
import { SharedCountdownOverlay } from "../components/room/SharedCountdownOverlay";
import { TTSAnnouncementPanel, speakTTSMessage } from "../components/room/TTSAnnouncementPanel";
import { useLiveTranscription } from "../hooks/useLiveTranscription";
import { useYouTubeCaptions } from "../hooks/useYouTubeCaptions";
import { computeContentScore, generateDiscussionQuestions } from "../utils/videoContentScore";
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  LogOut,
  Heart,
  MessageCircle,
  Megaphone,
  Users,
  Plus,
  Send,
  Menu,
  Crown,
  Sun,
  Moon,
  Info,
  Gauge,
  ThumbsUp,
  BarChart3,
  Shield,
  History,
  Share2,
  Clapperboard,
  LayoutList,
  Volume2,
  Mic,
  MicOff,
  EyeOff,
  Sparkles
} from "lucide-react";
import { LeaveRoomDialog } from "./LeaveRoomDialog";
import { RoomInfoPanel } from "../components/room/RoomInfoPanel";
import { RoomRatingPanel } from "../components/room/RoomRatingPanel";
import { VideoVotePanel } from "../components/room/VideoVotePanel";
import { ParticipantsPermissionsPanel } from "../components/room/ParticipantsPermissionsPanel";
import { SpeakingRequestsPanel, type SpeakingRequestEntry } from "../components/room/SpeakingRequestsPanel";
import { VideoManagementPanel } from "../components/room/VideoManagementPanel";
import { VideoHistoryPanel } from "../components/room/VideoHistoryPanel";
import { ComprehensionBarometerPanel } from "../components/room/ComprehensionBarometerPanel";
import { RegieActionHistoryPanel, type RegieActionEntry } from "../components/room/RegieActionHistoryPanel";
import { RegieProgramPanel, type RegieProgramStep, type RegieProgramStepDraft } from "../components/room/RegieProgramPanel";
import { ShareRoomDialog } from "../components/room/ShareRoomDialog";
import { RegieAnnouncementDialog } from "../components/room/RegieAnnouncementDialog";
import { SessionLockPanel, type SessionLockState } from "../components/room/SessionLockPanel";
import { SessionInterludePanel, type SessionInterludeDraft } from "../components/room/SessionInterludePanel";
import { VideoBookmarkDialog } from "../components/room/VideoBookmarkDialog";
import { YouTubePlayer } from "../components/room/YouTubePlayer";
import { EmptyState } from "../components/room/EmptyStates";
import { toast } from "sonner";
import {
  fetchComprehensionSignals,
  upsertComprehensionSignal,
  type ComprehensionSignalEntry,
  type ComprehensionSignalStatus,
} from "../api/comprehensionSignals";
import { createRegieHistoryEntry, fetchRegieHistory } from "../api/regieHistory";
import { fetchSessionInterlude, upsertSessionInterlude, type SessionInterludeState as PersistedSessionInterludeState } from "../api/sessionInterlude";
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

interface LegacyRegieActionEntry {
  id: string;
  action: string;
  details: string;
  user: string;
  time: string;
}

interface LiveVideoVotePoll {
  pollId: string;
  startedAt: number;
  endsAt: number | null;
  isActive: boolean;
  startedBy: string;
  votes: Record<string, number>;
  voterChoices: Record<string, string>;
  winnerVideoId?: string | null;
}

type VideoTransitionType = "cut" | "fade_black" | "slide_lateral" | "flash_white";
type RegieProgramStatus = "idle" | "running" | "paused";

interface InterludeApplyOptions {
  persist?: boolean;
  quiet?: boolean;
  trackHistory?: boolean;
}

const VIDEO_TRANSITIONS: Array<{ value: VideoTransitionType; label: string }> = [
  { value: "cut", label: "â¬› Cut brutal" },
  { value: "fade_black", label: "ðŸŒ«ï¸ Fondu au noir" },
  { value: "slide_lateral", label: "â†”ï¸ Glissement latÃ©ral" },
  { value: "flash_white", label: "âšª Flash blanc" },
];
const REGIE_PROGRAM_STEP_BUFFER_MS = 450;
const REGIE_PROGRAM_COMPLETION_MESSAGE = "Merci pour votre ecoute, la seance est terminee.";

const sortSpeakingRequests = (entries: SpeakingRequestEntry[]) =>
  [...entries].sort((a, b) => a.requestedAt - b.requestedAt);

const mapSpeakingRequestsById = (entries: SpeakingRequestEntry[]) =>
  sortSpeakingRequests(entries).reduce<Record<string, SpeakingRequestEntry>>((acc, entry) => {
    acc[entry.participantId] = entry;
    return acc;
  }, {});

const normalizeSpeakingRequestEntry = (raw: any): SpeakingRequestEntry | null => {
  const participantId = String(raw?.participantId || "").trim();
  const participantName = String(raw?.participantName || "Participant").trim();
  if (!participantId) return null;

  return {
    participantId,
    participantName: participantName || "Participant",
    participantAvatar: String(raw?.participantAvatar || createAvatarDataUrl(participantName || "Participant")),
    requestedAt: Number(raw?.requestedAt) || Date.now(),
  };
};

interface RoomPageProps {
  roomId: string;
  roomName?: string;
  roomCreator?: string;
  currentUser: { email: string; name: string; id: string };
  onNavigate: (page: string, data?: any) => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

const reactions = ["â¤ï¸", "ðŸ˜‚", "ðŸ‘", "ðŸ”¥", "ðŸ˜®", "ðŸŽ‰"];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ANNOUNCEMENT_DURATION_MS = 20000;
const DEFAULT_SESSION_LOCK_STATE: SessionLockState = {
  roomLocked: false,
  chatDisabled: false,
  focusMode: false,
};

const DEFAULT_SESSION_INTERLUDE_STATE: PersistedSessionInterludeState = {
  enabled: false,
  message: "",
  endsAt: null,
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

const getInterludeDraftFromState = (
  state: PersistedSessionInterludeState
): SessionInterludeDraft => {
  let durationMinutes = 0;

  if (state.endsAt) {
    const endAt = new Date(state.endsAt).getTime();
    const updatedAt = state.updatedAt ? new Date(state.updatedAt).getTime() : Date.now();
    if (Number.isFinite(endAt) && Number.isFinite(updatedAt) && endAt > updatedAt) {
      durationMinutes = Math.max(0, Math.round((endAt - updatedAt) / 60000));
    }
  }

  return {
    enabled: state.enabled,
    message: state.message || "",
    durationMinutes,
  };
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

const mergeComprehensionSignals = (...lists: ComprehensionSignalEntry[][]) => {
  const byUser = new Map<string, ComprehensionSignalEntry>();

  for (const list of lists) {
    for (const entry of list) {
      if (!entry?.id || !entry?.userId) continue;
      const existing = byUser.get(entry.userId);
      if (!existing) {
        byUser.set(entry.userId, entry);
        continue;
      }

      const existingTime = new Date(existing.updatedAt).getTime();
      const nextTime = new Date(entry.updatedAt).getTime();
      byUser.set(
        entry.userId,
        nextTime >= existingTime ? entry : existing
      );
    }
  }

  return Array.from(byUser.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
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

const isAbortLikeError = (error: any) => {
  const name = String(error?.name || "");
  const message = String(error?.message || "").toLowerCase();
  return (
    name === "AbortError" ||
    message.includes("aborted") ||
    message.includes("abort")
  );
};

const isNetworkLikeError = (error: any) => {
  const name = String(error?.name || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return (
    name.includes("typeerror") ||
    message.includes("load failed") ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed")
  );
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
  const [currentScene, setCurrentScene] = useState<SceneMode>("split");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "participants" | "polls" | "barometer">("chat");
  const [backendSalonId, setBackendSalonId] = useState<string>("");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantPermissions, setParticipantPermissionsMap] = useState<PermissionsByParticipant>({});
  const [playlist, setPlaylist] = useState<VideoInPlaylist[]>([]);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [videoHistory, setVideoHistory] = useState<VideoHistoryEntry[]>([]);
  const [regieActions, setRegieActions] = useState<LegacyRegieActionEntry[]>([]);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showVideoVote, setShowVideoVote] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showVideoManagement, setShowVideoManagement] = useState(false);
  const [showSpeakingRequests, setShowSpeakingRequests] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRegieHistory, setShowRegieHistory] = useState(false);
  const [showRegieProgramPanel, setShowRegieProgramPanel] = useState(false);
  const [showAnnouncementPanel, setShowAnnouncementPanel] = useState(false);
  const [showPostVideoQuestionPanel, setShowPostVideoQuestionPanel] = useState(false);
  const [showPostVideoQuestion, setShowPostVideoQuestion] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [showSessionLockPanel, setShowSessionLockPanel] = useState(false);
  const [showInterludePanel, setShowInterludePanel] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [regieActionHistory, setRegieActionHistory] = useState<RegieActionEntry[]>([]);
  const [sessionLockState, setSessionLockState] = useState<SessionLockState>(DEFAULT_SESSION_LOCK_STATE);
  const [sessionInterlude, setSessionInterlude] = useState<PersistedSessionInterludeState>(DEFAULT_SESSION_INTERLUDE_STATE);
  const [videoBookmarks, setVideoBookmarks] = useState<VideoBookmarkEntry[]>([]);
  const [comprehensionSignals, setComprehensionSignals] = useState<ComprehensionSignalEntry[]>([]);
  const [savingComprehensionSignal, setSavingComprehensionSignal] = useState(false);
  const [interludeClockNow, setInterludeClockNow] = useState<number>(Date.now());
  const [roomCode, setRoomCode] = useState<string>("");
  const [role, setRole] = useState<SalonRole | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [videoVoteCounts, setVideoVoteCounts] = useState<Record<string, number>>({});
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [regieProgramCompletionScreen, setRegieProgramCompletionScreen] = useState<{
    visible: boolean;
    message: string;
  }>({
    visible: false,
    message: REGIE_PROGRAM_COMPLETION_MESSAGE,
  });
  const [postVideoQuestion, setPostVideoQuestion] = useState("");
  const [postVideoQuestionDraft, setPostVideoQuestionDraft] = useState("");
  const [postVideoQuestionVideoId, setPostVideoQuestionVideoId] = useState<string | null>(null);
  const [messageSalonColumn, setMessageSalonColumn] = useState<MessageRoomColumn>("salon_id");
  const [messageUserColumn, setMessageUserColumn] = useState<MessageAuthorColumn>("user_id");
  const [salonIdColumn, setSalonIdColumn] = useState<SalonIdColumn>("id_salon");
  const [storedReactionsByMessage, setStoredReactionsByMessage] = useState<MessageReactionsById>({});
  const [isMessagePollingEnabled, setIsMessagePollingEnabled] = useState(true);
  const [hoverPreviewVideoId, setHoverPreviewVideoId] = useState<string | null>(null);
  const [liveVideoVotePoll, setLiveVideoVotePoll] = useState<LiveVideoVotePoll | null>(null);
  const [speakingRequests, setSpeakingRequests] = useState<Record<string, SpeakingRequestEntry>>({});
  const [activeSpeakerRequest, setActiveSpeakerRequest] = useState<SpeakingRequestEntry | null>(null);
  const [videoVoteNow, setVideoVoteNow] = useState<number>(Date.now());
  const [selectedVideoTransition, setSelectedVideoTransition] = useState<VideoTransitionType>("cut");
  const [activeVideoTransition, setActiveVideoTransition] = useState<{ type: VideoTransitionType; key: number } | null>(null);
  const [regieProgramSteps, setRegieProgramSteps] = useState<RegieProgramStep[]>([]);
  const [regieProgramStatus, setRegieProgramStatus] = useState<RegieProgramStatus>("idle");
  const [regieProgramCurrentStepIndex, setRegieProgramCurrentStepIndex] = useState<number | null>(null);
  const [regieProgramWaitingForVideoEnd, setRegieProgramWaitingForVideoEnd] = useState(false);

  // â”€â”€ RÃ©gie : Compte Ã  rebours partagÃ© (feature 68) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [activeCountdown, setActiveCountdown] = useState<{ seconds: number; key: number; reason?: "manual" | "startup" } | null>(null);

  // â”€â”€ RÃ©gie : Annonce vocale TTS (feature 70) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [showTTSPanel, setShowTTSPanel] = useState(false);
  const [voiceCommentaryEnabled, setVoiceCommentaryEnabled] = useState(false);
  const [voiceCommentaryBusy, setVoiceCommentaryBusy] = useState(false);

  // â”€â”€ IA de Contenu â€” Ã‰tats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // D/G : Panneau de preview IA (avant lancement vidÃ©o)
  const [previewVideo, setPreviewVideo] = useState<VideoInPlaylist | null>(null);
  const [showContentPanel, setShowContentPanel] = useState(false);
  // E : Questions de discussion gÃ©nÃ©rÃ©es aprÃ¨s chaque vidÃ©o
  const [discussionQuestions, setDiscussionQuestions] = useState<[string, string, string] | null>(null);
  const [discussionVideoTitle, setDiscussionVideoTitle] = useState("");
  const lastDiscussionVideoIdRef = useRef<string | null>(null);
  // F : Transcription live (micro)
  const transcription = useLiveTranscription("fr-FR");

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
  const playlistRef = useRef<VideoInPlaylist[]>(playlist);
  const lastCurrentVideoIdRef = useRef<string | null>(null);
  const announcementTimeoutRef = useRef<number | null>(null);
  const hoverPreviewTimeoutRef = useRef<number | null>(null);
  const videoVoteFinalizingRef = useRef<boolean>(false);
  const startupCountdownTriggeredRef = useRef<boolean>(false);
  const videoTransitionTimeoutRef = useRef<number | null>(null);
  const regieProgramAdvanceTimeoutRef = useRef<number | null>(null);
  const regieProgramStatusRef = useRef<RegieProgramStatus>("idle");
  const regieProgramCurrentStepIndexRef = useRef<number | null>(null);
  const regieProgramWaitingForVideoEndRef = useRef<boolean>(false);
  const regieProgramStepsRef = useRef<RegieProgramStep[]>([]);
  const executeRegieProgramStepRef = useRef<((stepIndex: number) => Promise<void>) | null>(null);
  const messagePollingDisabledLoggedRef = useRef<boolean>(false);
  const messagePollingErrorCountRef = useRef<number>(0);
  const lastNetworkWarningAtRef = useRef<number>(0);
  const pendingPermissionUpdatesRef = useRef<Record<string, MemberPermissions>>({});
  const permissionFlushTimeoutRef = useRef<number | null>(null);
  const permissionFlushInFlightRef = useRef<boolean>(false);
  const localVoiceStreamRef = useRef<MediaStream | null>(null);
  const voicePeerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const voiceOfferInFlightRef = useRef<Record<string, boolean>>({});
  const remoteVoiceStreamRef = useRef<MediaStream | null>(null);
  const remoteVoiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceAutoplayWarnedRef = useRef<boolean>(false);
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
  const canManageVideoVotePoll =
    effectiveRole === "admin" || effectiveRole === "regie";
  const canVoteVideoPoll = true;
  const voteUserKey = authUserId || currentUser.id || currentUser.email || currentUser.name;
  const realtimeVoiceUserId = authUserId || currentUser.id || currentUser.email || currentUser.name;
  const canManageVoiceCommentary = effectiveRole === "admin" || effectiveRole === "regie";
  const canManageSpeakingRequests = effectiveRole === "admin" || effectiveRole === "regie";
  const speakingRequestParticipantId =
    selfParticipant?.id || authUserId || currentUser.id || currentUser.email || currentUser.name;
  const speakingQueue = sortSpeakingRequests(Object.values(speakingRequests));
  const speakingQueueCount = speakingQueue.length;
  const hasRaisedHand = Boolean(speakingRequests[speakingRequestParticipantId]);
  const isCurrentParticipantActiveSpeaker =
    activeSpeakerRequest?.participantId === speakingRequestParticipantId;
  const currentSpeakingRequestPosition = speakingQueue.findIndex(
    (entry) => entry.participantId === speakingRequestParticipantId
  );
  const liveVoteRemainingMs =
    liveVideoVotePoll?.isActive && liveVideoVotePoll?.endsAt
      ? Math.max(0, liveVideoVotePoll.endsAt - videoVoteNow)
      : 0;
  const liveVoteRemainingSeconds = Math.ceil(liveVoteRemainingMs / 1000);

  const pickWinningVideoId = useCallback((poll: LiveVideoVotePoll) => {
    const playlistOrder = playlist.map((video) => video.id);
    const entries = Object.entries(poll.votes || {}).filter(([videoId]) =>
      playlistOrder.includes(videoId)
    );
    if (entries.length === 0) return null;
    entries.sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return playlistOrder.indexOf(a[0]) - playlistOrder.indexOf(b[0]);
    });
    return entries[0][0];
  }, [playlist]);
  // Keep a ref updated so Supabase Realtime closures always see the current value
  canControlVideoRef.current = canControlVideo;
  playlistRef.current = playlist;
  regieProgramStatusRef.current = regieProgramStatus;
  regieProgramCurrentStepIndexRef.current = regieProgramCurrentStepIndex;
  regieProgramWaitingForVideoEndRef.current = regieProgramWaitingForVideoEnd;
  regieProgramStepsRef.current = regieProgramSteps;
  // Stable refs for participants/permissions so the Realtime channel doesn't need to reinitialize on every render
  const participantsRef = useRef<Participant[]>(participants);
  participantsRef.current = participants;
  const participantPermissionsRef = useRef<PermissionsByParticipant>(participantPermissions);
  participantPermissionsRef.current = participantPermissions;

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

  const appendComprehensionSignal = useCallback((entry: ComprehensionSignalEntry) => {
    setComprehensionSignals((prev) => mergeComprehensionSignals([entry], prev));
  }, []);

  const loadComprehensionSignals = useCallback(async () => {
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) {
      setComprehensionSignals([]);
      return;
    }

    try {
      const remoteSignals = await fetchComprehensionSignals(backendSalonId);
      setComprehensionSignals(remoteSignals);
    } catch (error) {
      console.error("Erreur chargement barometre comprehension:", error);
      setComprehensionSignals([]);
    }
  }, [backendSalonId]);

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

  const reportError = useCallback((label: string, error: any) => {
    if (isAbortLikeError(error)) return;
    if (isNetworkLikeError(error)) {
      const now = Date.now();
      if (now - lastNetworkWarningAtRef.current > 10000) {
        lastNetworkWarningAtRef.current = now;
        console.warn(`${label}: connexion rÃ©seau momentanÃ©ment indisponible.`);
      }
      return;
    }
    console.error(label, error);
  }, []);

  // Filtrer les participants pour Ã©viter que l'admin soit dans la liste
  const otherParticipants = participants.filter(p =>
    p.id !== currentUser.id &&
    p.id !== authUserId &&
    p.email !== currentUser.email &&
    p.id !== currentUser.email &&
    p.name !== currentUser.name
  );

  const participantCount = otherParticipants.filter(p => p.status === "online").length + 1; // +1 pour l'utilisateur courant
  const currentVideo = playlist.find(v => v.isCurrent);
  const regiePreviewVideo = previewVideoId
    ? playlist.find((video) => video.id === previewVideoId) || null
    : null;

  const clearAnnouncementTimeout = useCallback(() => {
    if (announcementTimeoutRef.current) {
      window.clearTimeout(announcementTimeoutRef.current);
      announcementTimeoutRef.current = null;
    }
  }, []);

  const showAnnouncementForDuration = useCallback(
    (message: string, durationMs = ANNOUNCEMENT_DURATION_MS) => {
      clearAnnouncementTimeout();
      setLiveAnnouncement(message);

      if (!message) return;

      announcementTimeoutRef.current = window.setTimeout(() => {
        setLiveAnnouncement("");
        announcementTimeoutRef.current = null;
      }, durationMs);
    },
    [clearAnnouncementTimeout]
  );

  useEffect(() => () => clearAnnouncementTimeout(), [clearAnnouncementTimeout]);

  const applyViewerSyncState = useCallback((payload: { time?: number; isPlaying?: boolean; videoId?: string | null }) => {
    const baseTime = Number(payload.time ?? 0);
    const playing = Boolean(payload.isPlaying);
    const now = Date.now();
    const effectiveTime = Math.max(0, baseTime);

    setCurrentTime(effectiveTime);
    setIsPlaying(playing);
    setSyncNonce(now);
    lastAdminPlayerTimeRef.current = effectiveTime;
    syncAnchorRef.current = {
      time: effectiveTime,
      at: now,
      playing,
      videoId: payload.videoId ?? syncAnchorRef.current.videoId ?? null,
    };
  }, []);
  // F : Sous-titres YouTube (captions rÃ©elles via Invidious, syncÃ©s avec currentTime)
  // âš ï¸ PlacÃ© ICI car currentVideo est dÃ©fini Ã  la ligne prÃ©cÃ©dente
  const ytCaptions = useYouTubeCaptions(
    currentVideo?.youtubeId,
    currentTime
  );
  const getTransitionDurationMs = (transition: VideoTransitionType) => {
    if (transition === "fade_black") return 520;
    if (transition === "slide_lateral") return 560;
    if (transition === "flash_white") return 260;
    return 0;
  };

  const playVideoTransition = useCallback(async (transition: VideoTransitionType) => {
    const duration = getTransitionDurationMs(transition);
    if (duration <= 0) return;

    if (videoTransitionTimeoutRef.current !== null) {
      window.clearTimeout(videoTransitionTimeoutRef.current);
      videoTransitionTimeoutRef.current = null;
    }
    setActiveVideoTransition({ type: transition, key: Date.now() });

    await new Promise<void>((resolve) => {
      videoTransitionTimeoutRef.current = window.setTimeout(() => {
        setActiveVideoTransition(null);
        videoTransitionTimeoutRef.current = null;
        resolve();
      }, duration);
    });
  }, []);

  const stopLocalVoiceStream = useCallback(() => {
    if (!localVoiceStreamRef.current) return;
    for (const track of localVoiceStreamRef.current.getTracks()) {
      track.stop();
    }
    localVoiceStreamRef.current = null;
  }, []);

  const stopRemoteVoiceStream = useCallback(() => {
    if (remoteVoiceAudioRef.current) {
      remoteVoiceAudioRef.current.srcObject = null;
    }
    if (remoteVoiceStreamRef.current) {
      for (const track of remoteVoiceStreamRef.current.getTracks()) {
        track.stop();
      }
      remoteVoiceStreamRef.current = null;
    }
  }, []);

  const closeVoicePeerConnection = useCallback((peerId: string) => {
    const pc = voicePeerConnectionsRef.current[peerId];
    if (!pc) return;
    try {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
    } catch {
      // no-op
    }
    delete voicePeerConnectionsRef.current[peerId];
    delete voiceOfferInFlightRef.current[peerId];
  }, []);

  const closeAllVoicePeerConnections = useCallback(() => {
    for (const peerId of Object.keys(voicePeerConnectionsRef.current)) {
      closeVoicePeerConnection(peerId);
    }
  }, [closeVoicePeerConnection]);

  const sendVoiceSignal = useCallback(async (payload: Record<string, any>) => {
    if (!roomChannelRef.current || !realtimeVoiceUserId) return;
    try {
      await roomChannelRef.current.send({
        type: "broadcast",
        event: "room_voice_signal",
        payload: {
          ...payload,
          from: realtimeVoiceUserId,
          at: Date.now(),
        },
      });
    } catch (error) {
      console.error("Erreur signal voix live", error);
    }
  }, [realtimeVoiceUserId]);

  const shouldDisableMessagePolling = useCallback((error: any) => {
    const blob = [
      error?.message,
      error?.details,
      error?.hint,
      error?.error_description,
    ]
      .filter(Boolean)
      .join(" | ")
      .toLowerCase();
    const status = Number(
      error?.status ??
      error?.statusCode ??
      error?.response?.status ??
      NaN
    );

    if (status === 400) return true;
    if (blob.includes("bad request")) return true;
    if (blob.includes("permission denied")) return true;
    if (blob.includes("row-level security")) return true;
    if (blob.includes("relation \"messages\" does not exist")) return true;
    if (blob.includes("table \"messages\" does not exist")) return true;
    if (blob.includes("could not find the table")) return true;
    if (blob.includes("schema cache")) return true;
    if (blob.includes("42p01")) return true;
    return false;
  }, []);

  const ensureRemoteAudioPlayback = useCallback(async (stream: MediaStream) => {
    remoteVoiceStreamRef.current = stream;
    const audioEl = remoteVoiceAudioRef.current;
    if (!audioEl) return;
    audioEl.srcObject = stream;
    try {
      await audioEl.play();
      voiceAutoplayWarnedRef.current = false;
    } catch (error) {
      if (!voiceAutoplayWarnedRef.current) {
        voiceAutoplayWarnedRef.current = true;
        toast.info("Le commentaire vocal est prÃªt. Cliquez une fois sur la page pour activer le son.");
      }
      console.warn("Lecture audio live bloquÃ©e par le navigateur", error);
    }
  }, []);

  const createVoicePeerConnection = useCallback((peerId: string, withLocalTracks: boolean, forceReset = false) => {
    const existing = voicePeerConnectionsRef.current[peerId];
    if (existing && !forceReset) return existing;
    if (existing && forceReset) {
      closeVoicePeerConnection(peerId);
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      void sendVoiceSignal({
        type: "ice-candidate",
        to: peerId,
        candidate: event.candidate.toJSON(),
      });
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) return;
      void ensureRemoteAudioPlayback(stream);
    };

    pc.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
        closeVoicePeerConnection(peerId);
      }
    };

    if (withLocalTracks && localVoiceStreamRef.current) {
      for (const track of localVoiceStreamRef.current.getTracks()) {
        pc.addTrack(track, localVoiceStreamRef.current);
      }
    }

    voicePeerConnectionsRef.current[peerId] = pc;
    return pc;
  }, [closeVoicePeerConnection, ensureRemoteAudioPlayback, sendVoiceSignal]);

  const connectVoiceToPeer = useCallback(async (peerId: string) => {
    if (!localVoiceStreamRef.current) return;
    if (voiceOfferInFlightRef.current[peerId]) return;

    voiceOfferInFlightRef.current[peerId] = true;
    try {
      // Always reset the peer before a new offer to keep m-line ordering stable.
      const pc = createVoicePeerConnection(peerId, true, true);
      const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });
      await pc.setLocalDescription(offer);
      await sendVoiceSignal({
        type: "offer",
        to: peerId,
        sdp: offer,
      });
    } finally {
      voiceOfferInFlightRef.current[peerId] = false;
    }
  }, [createVoicePeerConnection, sendVoiceSignal]);

  const teardownVoiceInfrastructure = useCallback(() => {
    stopLocalVoiceStream();
    closeAllVoicePeerConnections();
    stopRemoteVoiceStream();
  }, [
    closeAllVoicePeerConnections,
    stopLocalVoiceStream,
    stopRemoteVoiceStream,
  ]);

  const stopVoiceCommentary = useCallback(async (broadcastState = true) => {
    setVoiceCommentaryEnabled(false);
    setVoiceCommentaryBusy(false);
    teardownVoiceInfrastructure();
    if (broadcastState) {
      await sendVoiceSignal({
        type: "voice-state",
        enabled: false,
      });
    }
  }, [
    sendVoiceSignal,
    teardownVoiceInfrastructure,
  ]);

  const startVoiceCommentary = useCallback(async () => {
    if (!canManageVoiceCommentary || !realtimeVoiceUserId) {
      toast.error("Seule la regie peut activer la voix live");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Votre navigateur ne supporte pas le micro en direct");
      return;
    }
    if (voiceCommentaryEnabled || voiceCommentaryBusy) return;

    setVoiceCommentaryBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      localVoiceStreamRef.current = stream;
      setVoiceCommentaryEnabled(true);
      await sendVoiceSignal({
        type: "voice-state",
        enabled: true,
      });

      const targets = participantsRef.current
        .filter((participant) =>
          participant.status === "online" &&
          participant.id !== currentUser.id &&
          participant.id !== authUserId &&
          participant.email !== currentUser.email &&
          participant.name !== currentUser.name
        )
        .map((participant) => participant.id)
        .filter(Boolean);

      for (const peerId of targets) {
        await connectVoiceToPeer(peerId);
      }

      toast.success("Mode commentaire vocal active");
      toast.success("🎙️ Mode commentaire vocal activé");
      void broadcastRegieAction("sync", "Synchronisation envoyee", "La regie a resynchronise tous les participants");
    } catch (error: any) {
      console.error("Erreur activation voix live", error);
      toast.error(error?.message || "Impossible d'accÃ©der au micro");
      await stopVoiceCommentary(false);
    } finally {
      setVoiceCommentaryBusy(false);
    }
  }, [
    authUserId,
    canManageVoiceCommentary,
    connectVoiceToPeer,
    currentUser.email,
    currentUser.id,
    currentUser.name,
    realtimeVoiceUserId,
    sendVoiceSignal,
    stopVoiceCommentary,
    voiceCommentaryBusy,
    voiceCommentaryEnabled,
  ]);

  const handleVoiceSignal = useCallback(async (data: any) => {
    const fromId = String(data?.from || "");
    if (!fromId || fromId === String(realtimeVoiceUserId || "")) return;

    const targetId = data?.to ? String(data.to) : null;
    if (targetId && targetId !== String(realtimeVoiceUserId || "")) return;

    const signalType = String(data?.type || "");

    if (signalType === "voice-state") {
      const enabled = Boolean(data?.enabled);
      if (!enabled) {
        setVoiceCommentaryEnabled(false);
        closeAllVoicePeerConnections();
        stopRemoteVoiceStream();
      } else if (!canManageVoiceCommentary) {
        setVoiceCommentaryEnabled(true);
      }
      return;
    }

    if (signalType === "offer") {
      if (canManageVoiceCommentary) return;
      const offer = data?.sdp;
      if (!offer) return;

      const pc = createVoicePeerConnection(fromId, false);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendVoiceSignal({
        type: "answer",
        to: fromId,
        sdp: answer,
      });
      return;
    }

    if (signalType === "answer") {
      const answer = data?.sdp;
      if (!answer) return;
      const pc = voicePeerConnectionsRef.current[fromId];
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      return;
    }

    if (signalType === "ice-candidate") {
      const candidate = data?.candidate;
      if (!candidate) return;
      const pc = voicePeerConnectionsRef.current[fromId];
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.warn("ICE candidate ignorÃ© (ordre de signalisation)", error);
      }
    }
  }, [
    canManageVoiceCommentary,
    closeAllVoicePeerConnections,
    createVoicePeerConnection,
    realtimeVoiceUserId,
    sendVoiceSignal,
    stopRemoteVoiceStream,
  ]);
  const learnerParticipants = participants.filter((participant) => participant.role === "member");
  const onlineLearnerParticipants = learnerParticipants.filter((participant) => participant.status === "online");
  const learnerParticipantsById = new Map(learnerParticipants.map((participant) => [participant.id, participant]));
  const activeComprehensionSignals = comprehensionSignals.filter((signal) => {
    const participant = learnerParticipantsById.get(signal.userId);
    if (!participant) return true;
    return participant.status === "online";
  });
  const currentUserSignal =
    comprehensionSignals.find((signal) => currentPermissionKeyCandidates.includes(signal.userId)) || null;
  const lostComprehensionCount = activeComprehensionSignals.filter((signal) => signal.status === "lost").length;
  const currentVideoBookmarks = currentVideo
    ? videoBookmarks
      .filter((bookmark) => bookmark.videoId === currentVideo.id)
      .sort((a, b) => a.time - b.time)
    : [];
  const interludeEndAtMs = sessionInterlude.endsAt ? new Date(sessionInterlude.endsAt).getTime() : null;
  const isInterludeVisible =
    sessionInterlude.enabled &&
    (!interludeEndAtMs || !Number.isFinite(interludeEndAtMs) || interludeEndAtMs > interludeClockNow);
  const interludeRemainingSeconds =
    interludeEndAtMs && Number.isFinite(interludeEndAtMs)
      ? Math.max(0, Math.ceil((interludeEndAtMs - interludeClockNow) / 1000))
      : null;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendSalonId, roomId]);

  const loadMessagesSnapshot = useCallback(async () => {
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) return;
    if (!isMessagePollingEnabled) return;
    let messagesData: any[] | null = null;
    let msgError: any = null;
    let resolvedSalonColumn: MessageRoomColumn = messageSalonColumnRef.current;

    try {
      ({ data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq(resolvedSalonColumn, backendSalonId));
    } catch (error) {
      if (isNetworkLikeError(error)) return;
      throw error;
    }

    // Schema fallback for messages room column.
    for (let i = 0; msgError && i < MESSAGE_ROOM_COLUMNS.length - 1; i += 1) {
      if (!hasMissingColumnError(msgError, resolvedSalonColumn)) break;
      resolvedSalonColumn = getNextMessageRoomColumn(resolvedSalonColumn);
      try {
        ({ data: messagesData, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq(resolvedSalonColumn, backendSalonId));
      } catch (error) {
        if (isNetworkLikeError(error)) return;
        throw error;
      }
      if (!msgError) {
        messageSalonColumnRef.current = resolvedSalonColumn;
        if (resolvedSalonColumn !== messageSalonColumn) {
          setMessageSalonColumn(resolvedSalonColumn);
        }
      }
    }

    if (msgError) {
      const blob = [
        msgError?.message,
        msgError?.details,
        msgError?.hint,
        msgError?.error_description,
      ]
        .filter(Boolean)
        .join(" | ")
        .toLowerCase();
      const isFatalMessagesSchemaError =
        blob.includes("relation \"messages\" does not exist") ||
        blob.includes("table \"messages\" does not exist") ||
        blob.includes("could not find the table") ||
        blob.includes("schema cache") ||
        blob.includes("42p01");
      const shouldDisableNow = shouldDisableMessagePolling(msgError);
      messagePollingErrorCountRef.current += 1;
      const tooManyConsecutiveErrors = messagePollingErrorCountRef.current >= 5;

      if ((isFatalMessagesSchemaError || shouldDisableNow || tooManyConsecutiveErrors) && !messagePollingDisabledLoggedRef.current) {
        messagePollingDisabledLoggedRef.current = true;
        setIsMessagePollingEnabled(false);
        console.warn("Polling messages dÃ©sactivÃ© aprÃ¨s erreurs rÃ©pÃ©tÃ©es (messages).");
      }
      return;
    }
    messagePollingErrorCountRef.current = 0;

    const canSenderChat = (senderId: string | null) => {
      if (!senderId) return true;
      const senderRole =
        participantsRef.current.find((p) => p.id === senderId)?.role || null;
      const senderPermissions =
        participantPermissionsRef.current[senderId] || normalizePermissions(senderRole, null);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendSalonId, messageSalonColumn, storedReactionsByMessage, isMessagePollingEnabled, shouldDisableMessagePolling]);

  const loadRoomSnapshot = useCallback(async () => {
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) return;

    await loadMessagesSnapshot();

    // Load salon state (without video(*) join which can fail if FK is not properly configured)
    const { data: salonData, error: salonError } = await selectSalonSingle(
      'current_video_id, id_playlist, video_time, video_status'
    );

    if (salonError || !salonData) {
      // Fallback: attempt to load playlist even if salon state read fails
      console.warn("Erreur lecture Ã©tat salon, tentative chargement playlist directement", salonError);
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
        reportError("Erreur connexion salon", error);
      }
    };

    connect();

    return () => {
      disconnectFromSalon(backendSalonId).catch((error) => {
        reportError("Erreur dÃ©connexion salon", error);
      });
    };
  }, [backendSalonId, reportError]);

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
        reportError("Erreur chargement participants", error);
      }
    };

    loadParticipants();
    const interval = window.setInterval(loadParticipants, 15000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [loadParticipantsSnapshot, reportError]);

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
      reportError("Erreur chargement initial", error);
    });

    // 3. Realtime Subscription (Salon + Participants + Broadcast only)
    // NOTE: messages postgres_changes is intentionally removed â€” Supabase returns 400
    // when Realtime is not enabled for the 'messages' table. Messages are refreshed
    // via the 30s polling interval instead (see useEffect below).
    const channel = supabase
      .channel(`room-${backendSalonId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'salon', filter: `id_salon=eq.${backendSalonId}` },
        async (payload) => {
          lastRealtimeSyncAtRef.current = Date.now();
          const newSalonState = payload.new;
          const nextTime = Number(newSalonState?.video_time || 0);

          // Viewers follow salon state strictly.
          if (!canControlVideoRef.current) {
            applyViewerSyncState({
              time: nextTime,
              isPlaying: newSalonState?.video_status === "playing",
              videoId: newSalonState?.current_video_id ? String(newSalonState.current_video_id) : null,
            });
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

            // If video not found in playlist, reload. No toast here â€” the broadcast handles it.
            if (!found) {
              await loadRoomSnapshot();
            } else if (videoChanged) {
              // Only notify via this channel if no broadcast is expected
              // (broadcast from admin will show its own toast)
              // So we skip toast here â€” broadcasts handle all notifications
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
        'postgres_changes',
        { event: '*', schema: 'public', table: 'session_comprehension_signals', filter: `salon_id=eq.${backendSalonId}` },
        async () => {
          await loadComprehensionSignals();
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

          const incomingVideoId = data.videoId ? String(data.videoId) : null;
          const shouldAnimateTransition =
            incomingVideoId !== null &&
            incomingVideoId !== lastCurrentVideoIdRef.current &&
            typeof data.transition === "string" &&
            ["fade_black", "slide_lateral", "flash_white"].includes(data.transition);
          if (shouldAnimateTransition) {
            await playVideoTransition(data.transition as VideoTransitionType);
          }

          // Apply time sync
          if (typeof data.time === "number") {
            const nextTime = Math.max(0, data.time);
            applyViewerSyncState({
              time: nextTime,
              isPlaying: typeof data.isPlaying === "boolean" ? data.isPlaying : isPlayingRef.current,
              videoId: data.videoId ? String(data.videoId) : syncAnchorRef.current.videoId,
            });
          }
          if (typeof data.isPlaying === "boolean") {
            setIsPlaying(data.isPlaying);
          }

          // Update playlist if videoId changed
          if (data.videoId) {
            lastCurrentVideoIdRef.current = String(data.videoId);
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
            toast.info("La vidÃ©o redÃ©marre depuis le dÃ©but ðŸ”„");
          } else if (data.explicit) {
            toast.info("ðŸ“¡ Synchronisation reÃ§ue");
          }
        }
      )
      .on(
        'broadcast',
        { event: 'room_scene_change' },
        (payload) => {
          const data = payload?.payload || {};
          // Only apply if sent by someone else
          if (data?.by === currentUser.id) return;
          if (data?.scene) {
            setCurrentScene(data.scene as SceneMode);
          }
        }
      )
      .on(
        'broadcast',
        { event: 'room_announcement' },
        (payload) => {
          const data = payload?.payload || {};
          if (data?.by === currentUser.id) return;

          const message = typeof data.message === "string" ? data.message : "";
          const durationMs = Number(data.durationMs) || ANNOUNCEMENT_DURATION_MS;
          showAnnouncementForDuration(message, durationMs);

          if (message) {
            toast.info("Annonce de la rÃ©gie");
          } else {
            toast.info("Annonce rÃ©gie retirÃ©e");
          }
        }
      )
      .on(
        'broadcast',
        { event: 'room_comprehension_signal' },
        async (payload) => {
          const entry = payload?.payload?.entry as ComprehensionSignalEntry | undefined;
          if (!entry?.id || !entry?.userId) return;
          appendComprehensionSignal(entry);
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
        { event: 'room_post_video_question' },
        (payload) => {
          const data = payload?.payload || {};
          if (data?.by === currentUser.id) return;

          const question = typeof data.question === "string" ? data.question : "";
          const videoId = data.videoId ? String(data.videoId) : null;
          setPostVideoQuestion(question);
          setPostVideoQuestionDraft(question);
          setPostVideoQuestionVideoId(videoId);
          setShowPostVideoQuestion(false);

          toast.info(question ? "Question de fin de vidÃ©o prÃ©parÃ©e" : "Question de fin de vidÃ©o retirÃ©e");
        }
      )
      .on(
        'broadcast',
        { event: 'room_post_video_question_show' },
        (payload) => {
          const data = payload?.payload || {};
          if (data?.by === currentUser.id) return;

          const question = typeof data.question === "string" ? data.question : "";
          const videoId = data.videoId ? String(data.videoId) : null;
          if (!question) return;

          setPostVideoQuestion(question);
          setPostVideoQuestionDraft(question);
          setPostVideoQuestionVideoId(videoId);
          setShowPostVideoQuestion(true);

          toast.info("Question de fin de vidÃ©o affichÃ©e");
        }
      )
      .on(
        'broadcast',
        { event: 'room_regie_program_completion' },
        (payload) => {
          const data = payload?.payload || {};
          if (data?.by === currentUser.id) return;

          setRegieProgramCompletionScreen({
            visible: Boolean(data.visible),
            message:
              typeof data.message === "string" && data.message.trim()
                ? data.message
                : REGIE_PROGRAM_COMPLETION_MESSAGE,
          });
        }
      )
      .on(
        'broadcast',
        { event: 'room_video_vote_poll' },
        (payload) => {
          const data = payload?.payload || {};
          if (data?.by === currentUser.id) return;
          if (!data?.poll || typeof data.poll !== "object") return;
          setLiveVideoVotePoll(data.poll as LiveVideoVotePoll);
          if (data.action === "start") {
            setShowVideoVote(true);
            toast.info("ðŸ—³ï¸ La rÃ©gie a lancÃ© un vote (5 min)");
          }
          if (data.action === "finish") {
            const winnerId = (data.poll as LiveVideoVotePoll).winnerVideoId;
            const winner = winnerId ? playlist.find((video) => video.id === winnerId) : null;
            if (winner) {
              toast.success(`RÃ©sultat du vote: "${winner.title}"`);
            } else {
              toast.info("RÃ©sultat du vote disponible");
            }
          }
        }
      )
      // â”€â”€ Feature 68 : Compte Ã  rebours partagÃ© â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      .on(
        'broadcast',
        { event: 'room_session_interlude' },
        async (payload) => {
          const data = payload?.payload || {};
          if (!data?.state || data?.by === currentUser.id) return;

          const nextState: PersistedSessionInterludeState = {
            enabled: Boolean(data.state.enabled),
            message: String(data.state.message || ""),
            endsAt: data.state.endsAt ? String(data.state.endsAt) : null,
            updatedBy: data?.byName || data.state.updatedBy,
            updatedAt: data.state.updatedAt ? String(data.state.updatedAt) : new Date().toISOString(),
          };

          setSessionInterlude(nextState);
          setInterludeClockNow(Date.now());

          toast.info(nextState.enabled ? "Mode interlude active" : "Mode interlude desactive", {
            description: nextState.enabled
              ? nextState.message || "Pause en cours pour tous les participants"
              : "Le player revient au mode normal",
            duration: 4500,
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
      .on(
        'broadcast',
        { event: 'room_countdown' },
        (payload) => {
          const data = payload?.payload || {};
          // Show the countdown for everyone (including sender is fine here)
          if (typeof data.seconds === "number" && data.seconds > 0) {
            const reason = data?.reason === "startup" ? "startup" : "manual";
            if (reason === "startup") {
              startupCountdownTriggeredRef.current = true;
            }
            setActiveCountdown({ seconds: data.seconds, key: Date.now(), reason });
          }
        }
      )
      // â”€â”€ Feature 70 : Annonce vocale TTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      .on(
        'broadcast',
        { event: 'room_tts_announce' },
        (payload) => {
          const data = payload?.payload || {};
          // The rÃ©gie already spoke locally; others read here
          if (data?.by === currentUser.id) return;
          if (typeof data.text === "string" && data.text.trim()) {
            speakTTSMessage(data.text.trim());
            toast.info(`ðŸ“¢ Annonce : "${data.text.trim().slice(0, 60)}${data.text.length > 60 ? 'â€¦' : ''}"`)
          }
        }
      )
      .on(
        "broadcast",
        { event: "room_permissions_update" },
        (payload) => {
          const data = payload?.payload || {};
          if (data?.by === currentUser.id) return;
          const updates = Array.isArray(data?.updates) ? data.updates : [];
          if (updates.length === 0) return;

          setParticipantPermissionsMap((prev) => {
            const next = { ...prev };
            for (const update of updates) {
              const participantId = String(update?.participantId || "");
              const nextPermissions = update?.nextPermissions as MemberPermissions | undefined;
              if (!participantId || !nextPermissions) continue;
              next[participantId] = normalizePermissions(
                participantsRef.current.find((p) => p.id === participantId)?.role || "member",
                nextPermissions
              );
            }
            return next;
          });

          for (const update of updates) {
            const participantId = String(update?.participantId || "");
            const nextPermissions = update?.nextPermissions as MemberPermissions | undefined;
            if (!participantId || !nextPermissions) continue;
            const isMe =
              participantId === authUserId ||
              participantId === currentUser.id;
            if (!isMe) continue;

            if (!nextPermissions.chat || nextPermissions.muted) {
              setNewMessage("");
              toast.error("Le chat vient d'être désactivé pour vous");
            } else {
              toast.success("Le chat est activé pour vous");
            }
          }
        }
      )
      .on(
        "broadcast",
        { event: "room_speaking_requests" },
        (payload) => {
          const data = payload?.payload || {};
          if (data?.by === currentUser.id) return;

          const queue = Array.isArray(data?.queue)
            ? sortSpeakingRequests(
                data.queue
                  .map((entry: any) => normalizeSpeakingRequestEntry(entry))
                  .filter(Boolean) as SpeakingRequestEntry[]
              )
            : [];
          const target = normalizeSpeakingRequestEntry(data?.target);
          const activeSpeaker = normalizeSpeakingRequestEntry(data?.activeSpeaker);

          setSpeakingRequests(mapSpeakingRequestsById(queue));
          setActiveSpeakerRequest(activeSpeaker);

          if (data?.action === "raise" && target) {
            if (canManageSpeakingRequests) {
              toast.info(`${target.participantName} demande la parole`);
            }
            return;
          }

          if (data?.action === "cancel" && target) {
            if (canManageSpeakingRequests) {
              toast.info(`${target.participantName} a retire sa demande`);
            }
            return;
          }

          if (data?.action === "approve" && target) {
            if (target.participantId === speakingRequestParticipantId) {
              toast.success("La regie vous donne la parole");
            } else {
              toast.info(`${target.participantName} a la parole`);
            }
            return;
          }

          if (data?.action === "remove" && target) {
            if (target.participantId === speakingRequestParticipantId) {
              toast.info("Votre demande de parole a ete retiree");
            }
            return;
          }

          if (data?.action === "clear_active" && target && target.participantId === speakingRequestParticipantId) {
            toast.info("Votre prise de parole est terminee");
          }
        }
      )
      .on(
        'broadcast',
        { event: 'room_voice_signal' },
        (payload) => {
          const data = payload?.payload || {};
          void handleVoiceSignal(data);
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          // 400 from Supabase â€” table may not have Realtime enabled.
          // Do NOT retry automatically to avoid flooding the console.
          console.warn("âš ï¸ Supabase Realtime: CHANNEL_ERROR (400). VÃ©rifiez que la table 'messages' a Realtime activÃ© dans le dashboard Supabase.");
        }
      });

    roomChannelRef.current = channel;

    return () => {
      roomChannelRef.current = null;
      void supabase.removeChannel(channel).catch((error) => {
        reportError("Erreur removeChannel", error);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, backendSalonId, applyViewerSyncState, playVideoTransition, handleVoiceSignal, authUserId, currentUser.id, reportError, showAnnouncementForDuration, loadRoomSnapshot, loadParticipantsSnapshot, currentUser.email, canControlVideo, participants, participantPermissions, appendRegieAction, appendVideoBookmark, describeSessionLockState, persistSessionLockState, loadComprehensionSignals, canManageSpeakingRequests, speakingRequestParticipantId]);

  useEffect(() => {
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) return;
    setIsMessagePollingEnabled(true);
    messagePollingDisabledLoggedRef.current = false;
    messagePollingErrorCountRef.current = 0;
  }, [backendSalonId]);

  useEffect(() => {
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) return;
    if (!isMessagePollingEnabled) return;

    const refreshMessages = async () => {
      try {
        await loadMessagesSnapshot();
      } catch (error) {
        reportError("Erreur refresh messages", error);
      }
    };

    refreshMessages();
    const interval = window.setInterval(refreshMessages, 3000);
    return () => window.clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendSalonId, isMessagePollingEnabled, reportError, loadMessagesSnapshot]);

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

    const loadInterludeState = async () => {
      if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) {
        if (isMounted) {
          setSessionInterlude(DEFAULT_SESSION_INTERLUDE_STATE);
        }
        return;
      }

      try {
        const remoteState = await fetchSessionInterlude(backendSalonId);
        if (!isMounted) return;
        setSessionInterlude(remoteState);
        setInterludeClockNow(Date.now());
      } catch (error) {
        console.error("Erreur chargement interlude base:", error);
        if (isMounted) {
          setSessionInterlude(DEFAULT_SESSION_INTERLUDE_STATE);
        }
      }
    };

    void loadInterludeState();

    return () => {
      isMounted = false;
    };
  }, [backendSalonId]);

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
    void loadComprehensionSignals();
  }, [loadComprehensionSignals]);

  useEffect(() => {
    setInterludeClockNow(Date.now());

    if (!sessionInterlude.enabled || !sessionInterlude.endsAt) return;

    const interval = window.setInterval(() => {
      setInterludeClockNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [sessionInterlude.enabled, sessionInterlude.endsAt]);

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
      if (isSyncing) return; // Ã‰viter les appels overlapping
      isSyncing = true;
      try {
        const { data, error } = await selectSalonSingle('current_video_id, video_time, video_status');
        if (error || !data) return;

        const salonData = data as any;
        const fetchAt = Date.now();
        const baseTime = Number(salonData.video_time || 0);
        const nextPlaying = salonData.video_status === "playing";
        const adjustedTime = nextPlaying
          ? Math.max(0, baseTime + (Date.now() - fetchAt) / 1000)
          : Math.max(0, baseTime);

        applyViewerSyncState({
          time: adjustedTime,
          isPlaying: nextPlaying,
          videoId: salonData.current_video_id ? String(salonData.current_video_id) : null,
        });

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
        reportError("Erreur sync automatique salon", err);
      } finally {
        isSyncing = false;
      }
    };

    syncFromSalon();
    const interval = window.setInterval(syncFromSalon, 3000);

    const onOnline = () => {
      void syncFromSalon();
    };
    const onFocus = () => {
      void syncFromSalon();
    };
    const onVisibility = () => {
      if (!document.hidden) void syncFromSalon();
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [backendSalonId, canControlVideo, loadRoomSnapshot, selectSalonSingle, applyViewerSyncState, reportError]);

  // Keep favorite flags in sync without blocking initial playlist load.
  useEffect(() => {
    setPlaylist((prev) =>
      prev.map((video) => ({
        ...video,
        isFavorite: video.youtubeId ? favoriteIds.has(video.youtubeId) : false,
      }))
    );
  }, [favoriteIds]);


  // Sauvegarder l'historique des vidÃ©os
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
    if (!liveVideoVotePoll?.isActive) return;
    setVideoVoteNow(Date.now());
    const interval = window.setInterval(() => {
      setVideoVoteNow(Date.now());
    }, 250);
    return () => window.clearInterval(interval);
  }, [liveVideoVotePoll?.pollId, liveVideoVotePoll?.isActive]);

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
      console.error("Erreur chargement votes vidÃ©o:", error);
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

    // â”€â”€ Feature E : gÃ©nÃ©rer des questions de discussion aprÃ¨s chaque vidÃ©o â”€â”€
    if (lastDiscussionVideoIdRef.current !== currentVideo.id) {
      lastDiscussionVideoIdRef.current = currentVideo.id;
      const questions = generateDiscussionQuestions({
        title: currentVideo.title,
        duration: currentVideo.duration,
        youtubeId: currentVideo.youtubeId,
      });
      setDiscussionQuestions(questions);
      setDiscussionVideoTitle(currentVideo.title);
    }
  }, [currentVideo?.id, currentVideo?.youtubeId, currentUser.name, currentVideo?.title, currentVideo?.thumbnail, currentVideo?.duration]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !backendSalonId) return;
    if (!canUseChat) {
      toast.error("Le chat est dÃ©sactivÃ© pour vous");
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
      toast.error("Le chat est dÃ©sactivÃ© pour vous");
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
    const userId = currentUser.id || currentUser.email || "current";
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

  const addRegieAction = (action: string, details: string) => {
    const newAction: RegieActionEntry = {
      id: Date.now().toString(),
      action,
      details,
      user: currentUser.name,
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setRegieActions((prev) => [newAction, ...prev].slice(0, 100));
  };

  const broadcastSpeakingRequests = useCallback(
    async (
      action: "raise" | "cancel" | "approve" | "remove" | "clear_active",
      nextQueue: SpeakingRequestEntry[],
      target: SpeakingRequestEntry | null = null,
      nextActiveSpeaker: SpeakingRequestEntry | null = null
    ) => {
      if (!roomChannelRef.current) return;

      try {
        await roomChannelRef.current.send({
          type: "broadcast",
          event: "room_speaking_requests",
          payload: {
            by: currentUser.id,
            action,
            queue: nextQueue,
            target,
            activeSpeaker: nextActiveSpeaker,
          },
        });
      } catch (error) {
        console.error("Erreur broadcast demandes de parole", error);
      }
    },
    [currentUser.id]
  );

  const handleRaiseHand = async () => {
    if (canManageSpeakingRequests) {
      toast.info("La regie gere deja les prises de parole");
      return;
    }

    if (activeSpeakerRequest?.participantId === speakingRequestParticipantId) {
      toast.info("Vous avez deja la parole");
      return;
    }

    if (hasRaisedHand) {
      toast.info("Votre main est deja levee");
      return;
    }

    const request: SpeakingRequestEntry = {
      participantId: speakingRequestParticipantId,
      participantName: selfParticipant?.name || currentUser.name,
      participantAvatar: selfParticipant?.avatar || createAvatarDataUrl(currentUser.name),
      requestedAt: Date.now(),
    };

    const nextQueue = sortSpeakingRequests([...speakingQueue, request]);
    setSpeakingRequests(mapSpeakingRequestsById(nextQueue));

    await broadcastSpeakingRequests("raise", nextQueue, request, activeSpeakerRequest);
    toast.success("Demande de parole envoyee");
  };

  const handleLowerHand = async () => {
    const currentRequest = speakingRequests[speakingRequestParticipantId];
    if (!currentRequest) return;

    const nextQueue = speakingQueue.filter((entry) => entry.participantId !== speakingRequestParticipantId);
    setSpeakingRequests(mapSpeakingRequestsById(nextQueue));

    await broadcastSpeakingRequests("cancel", nextQueue, currentRequest, activeSpeakerRequest);
    toast.info("Demande de parole retiree");
  };

  const handleApproveSpeakingRequest = async (participantId: string) => {
    if (!canManageSpeakingRequests) return;
    if (activeSpeakerRequest && activeSpeakerRequest.participantId !== participantId) {
      toast.error("Terminez d'abord la prise de parole en cours");
      return;
    }

    const request = speakingRequests[participantId];
    if (!request) return;

    const nextQueue = speakingQueue.filter((entry) => entry.participantId !== participantId);
    setSpeakingRequests(mapSpeakingRequestsById(nextQueue));
    setActiveSpeakerRequest(request);

    if (isPlayingRef.current) {
      await handlePlayPause();
    }

    addRegieAction("Parole", `Prise de parole accordee a ${request.participantName}`);

    await broadcastSpeakingRequests("approve", nextQueue, request, request);
    toast.success(`${request.participantName} a la parole`);
  };

  const handleRemoveSpeakingRequest = async (participantId: string) => {
    if (!canManageSpeakingRequests) return;

    const request = speakingRequests[participantId];
    if (!request) return;

    const nextQueue = speakingQueue.filter((entry) => entry.participantId !== participantId);
    setSpeakingRequests(mapSpeakingRequestsById(nextQueue));
    addRegieAction("Parole", `Demande retiree pour ${request.participantName}`);

    await broadcastSpeakingRequests("remove", nextQueue, request, activeSpeakerRequest);
    toast.info(`Demande retiree pour ${request.participantName}`);
  };

  const handleClearActiveSpeaker = async () => {
    if (!canManageSpeakingRequests || !activeSpeakerRequest) return;

    const previousSpeaker = activeSpeakerRequest;
    setActiveSpeakerRequest(null);
    addRegieAction("Parole", `Fin de prise de parole pour ${previousSpeaker.participantName}`);

    await broadcastSpeakingRequests("clear_active", speakingQueue, previousSpeaker, null);
    toast.info("Prise de parole terminee");
  };

  const broadcastAnnouncement = async (message: string, durationMs = ANNOUNCEMENT_DURATION_MS) => {
    showAnnouncementForDuration(message, durationMs);

    if (roomChannelRef.current) {
      await roomChannelRef.current.send({
        type: "broadcast",
        event: "room_announcement",
        payload: {
          by: currentUser.id,
          at: Date.now(),
          message,
          durationMs,
        },
      });
    }
  };

  const broadcastRegieProgramCompletionScreen = async (
    visible: boolean,
    message = REGIE_PROGRAM_COMPLETION_MESSAGE
  ) => {
    setRegieProgramCompletionScreen({
      visible,
      message: message || REGIE_PROGRAM_COMPLETION_MESSAGE,
    });

    if (roomChannelRef.current) {
      await roomChannelRef.current.send({
        type: "broadcast",
        event: "room_regie_program_completion",
        payload: {
          by: currentUser.id,
          at: Date.now(),
          visible,
          message,
        },
      });
    }
  };

  const handlePublishAnnouncement = async () => {
    if (!canControlVideo) {
      toast.error("Seuls l'admin ou la rÃ©gie vidÃ©o peuvent envoyer une annonce");
      return;
    }

    const message = announcementDraft.trim();
    if (!message) {
      toast.error("Ã‰cris une annonce avant de l'envoyer");
      return;
    }

    try {
      await broadcastAnnouncement(message);
      addRegieAction("Annonce rÃ©gie", `Annonce affichÃ©e : ${message}`);
      setShowAnnouncementPanel(false);
      toast.success("Annonce affichÃ©e pour tous les participants");
    } catch (error) {
      console.error("Erreur annonce rÃ©gie", error);
      toast.error("Impossible d'envoyer l'annonce");
    }
  };

  const handleClearAnnouncement = async () => {
    if (!canControlVideo) {
      toast.error("Seuls l'admin ou la rÃ©gie vidÃ©o peuvent retirer une annonce");
      return;
    }

    try {
      await broadcastAnnouncement("");
      setAnnouncementDraft("");
      addRegieAction("Annonce rÃ©gie", "Annonce retirÃ©e");
      toast.success("Annonce retirÃ©e");
    } catch (error) {
      console.error("Erreur retrait annonce rÃ©gie", error);
      toast.error("Impossible de retirer l'annonce");
    }
  };

  const broadcastPostVideoQuestion = async (question: string, videoId: string | null) => {
    setPostVideoQuestion(question);
    setPostVideoQuestionDraft(question);
    setPostVideoQuestionVideoId(videoId);
    setShowPostVideoQuestion(false);

    if (roomChannelRef.current) {
      await roomChannelRef.current.send({
        type: "broadcast",
        event: "room_post_video_question",
        payload: {
          by: currentUser.id,
          at: Date.now(),
          question,
          videoId,
        },
      });
    }
  };

  const broadcastShowPostVideoQuestion = async (question: string, videoId: string | null) => {
    if (!roomChannelRef.current || !question) return;

    await roomChannelRef.current.send({
      type: "broadcast",
      event: "room_post_video_question_show",
      payload: {
        by: currentUser.id,
        at: Date.now(),
        question,
        videoId,
      },
    });
  };

  const handleSavePostVideoQuestion = async () => {
    if (!canControlVideo) {
      toast.error("Seuls l'admin ou la rÃ©gie vidÃ©o peuvent prÃ©parer une question");
      return;
    }

    if (!currentVideo?.id) {
      toast.error("Aucune vidÃ©o en cours pour associer la question");
      return;
    }

    const question = postVideoQuestionDraft.trim();
    if (!question) {
      toast.error("Ã‰cris une question avant de l'enregistrer");
      return;
    }

    try {
      await broadcastPostVideoQuestion(question, currentVideo.id);
      addRegieAction("Question aprÃ¨s vidÃ©o", `Question prÃ©parÃ©e : ${question}`);
      setShowPostVideoQuestionPanel(false);
      toast.success("Question prÃ©parÃ©e pour la fin de vidÃ©o");
    } catch (error) {
      console.error("Erreur question fin de vidÃ©o", error);
      toast.error("Impossible d'envoyer la question");
    }
  };

  const handleClearPostVideoQuestion = async () => {
    if (!canControlVideo) {
      toast.error("Seuls l'admin ou la rÃ©gie vidÃ©o peuvent retirer une question");
      return;
    }

    try {
      await broadcastPostVideoQuestion("", null);
      continueRegieProgramAfterPostVideoQuestion();
      addRegieAction("Question aprÃ¨s vidÃ©o", "Question retirÃ©e");
      toast.success("Question retirÃ©e");
    } catch (error) {
      console.error("Erreur retrait question fin de vidÃ©o", error);
      toast.error("Impossible de retirer la question");
    }
  };

  const handleClosePostVideoQuestion = () => {
    setShowPostVideoQuestion(false);
    continueRegieProgramAfterPostVideoQuestion();
  };

  const handleMainVideoEnded = useCallback(() => {
    const question = postVideoQuestion.trim();
    const canShowPostVideoQuestion =
      !showPostVideoQuestion &&
      !!question &&
      (!postVideoQuestionVideoId || !currentVideo?.id || postVideoQuestionVideoId === currentVideo.id);

    if (canShowPostVideoQuestion) {
      setShowPostVideoQuestion(true);
      if (canControlVideo) {
        void broadcastShowPostVideoQuestion(question, currentVideo?.id || postVideoQuestionVideoId || null);
      }
      toast.info("Question de fin de vidÃ©o affichÃ©e");
    }

    if (!regieProgramWaitingForVideoEndRef.current) return;

    if (canShowPostVideoQuestion) return;

    continueRegieProgramAfterPostVideoQuestion();
  }, [broadcastShowPostVideoQuestion, canControlVideo, currentVideo?.id, postVideoQuestion, postVideoQuestionVideoId, showPostVideoQuestion]);

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
        video_status: newPlayingState ? "playing" : "paused",
        video_time: currentTimeRef.current,
        current_video_id: currentVideo?.id || null,
      });
      if (playPauseError) throw playPauseError;

      if (roomChannelRef.current) {
        await roomChannelRef.current.send({
          type: "broadcast",
          event: "room_force_sync",
          payload: {
            by: currentUser.id,
            at: Date.now(),
            isPlaying: newPlayingState,
            time: currentTimeRef.current,
            videoId: currentVideo?.id || null,
            forceSeek: true,
            forceReload: true,
          },
        });
      }
    } catch (err) {
      console.error("Erreur sync video:", err);
    }
  }

  toast.success(
    newPlayingState
      ? `${currentUser.name} a lance la video`
      : `${currentUser.name} a mis en pause`,
    { icon: newPlayingState ? ">" : "||" }
  );
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
      toast.success("ðŸ“¡ Synchronisation envoyÃ©e Ã  tous les invitÃ©s");
    } catch (error: any) {
      toast.error(error?.message || "Erreur synchronisation");
      console.error("Erreur sync salon", error);
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

  const handleApplyInterlude = async (
    draft: SessionInterludeDraft,
    options: InterludeApplyOptions = {}
  ) => {
    if (!canControlVideo) {
      toast.error("Seuls l'admin ou la regie video peuvent controler l'interlude");
      return;
    }
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) {
      toast.error("Salon introuvable pour activer l'interlude");
      return;
    }

    const { persist = true, quiet = false, trackHistory = true } = options;

    const nowIso = new Date().toISOString();
    const trimmedMessage = draft.message.trim();
    const nextState: PersistedSessionInterludeState = {
      enabled: Boolean(draft.enabled),
      message: draft.enabled ? (trimmedMessage || "Pause en cours - reprise tres bientot") : "",
      endsAt:
        draft.enabled && draft.durationMinutes > 0
          ? new Date(Date.now() + draft.durationMinutes * 60_000).toISOString()
          : null,
      updatedBy: currentUser.name,
      updatedAt: nowIso,
    };

    let persistedState = nextState;

    if (persist) {
      try {
        persistedState = await upsertSessionInterlude(backendSalonId, nextState);
      } catch (error: any) {
        console.error("Erreur sauvegarde interlude en base", error);
        toast.error("Mode interlude non enregistre dans Supabase", {
          description: error?.message || "Verifie la table session_interludes et ses policies.",
          duration: 5000,
        });
        throw error;
      }
    }

    setSessionInterlude(persistedState);
    setInterludeClockNow(Date.now());

    if (persistedState.enabled) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setSyncNonce(Date.now());

      try {
        const { error: pauseError } = await updateSalonState({
          video_status: "paused",
          video_time: currentTimeRef.current,
          current_video_id: currentVideo?.id || null,
        });
        if (pauseError) throw pauseError;
      } catch (error) {
        console.error("Erreur pause video pendant interlude", error);
      }
    }

    if (roomChannelRef.current) {
      try {
        await roomChannelRef.current.send({
          type: "broadcast",
          event: "room_session_interlude",
          payload: {
            by: currentUser.id,
            byName: currentUser.name,
            at: Date.now(),
            state: persistedState,
          },
        });

        if (persistedState.enabled) {
          await roomChannelRef.current.send({
            type: "broadcast",
            event: "room_force_sync",
            payload: {
              by: currentUser.id,
              at: Date.now(),
              isPlaying: false,
              time: currentTimeRef.current,
              videoId: currentVideo?.id || null,
              forceSeek: true,
              forceReload: false,
            },
          });
        }
      } catch (error) {
        console.error("Erreur broadcast interlude", error);
      }
    }

    if (!quiet) {
      toast.success(persistedState.enabled ? "Mode interlude active" : "Mode interlude desactive");
    }
    if (trackHistory) {
      void broadcastRegieAction(
        "interlude",
        persistedState.enabled ? "Mode interlude active" : "Mode interlude desactive",
        persistedState.enabled
          ? persistedState.message
          : "Le salon revient a l'affichage video classique"
      );
    }
  };

  const handleSubmitComprehensionSignal = async (status: ComprehensionSignalStatus) => {
    if (canControlVideo) {
      toast.info("Le barometre live est reserve aux etudiants");
      return;
    }
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) {
      toast.error("Salon introuvable pour enregistrer le signal");
      return;
    }

    const signalUserId = authUserId || currentUser.id;
    if (!signalUserId) {
      toast.error("Utilisateur introuvable pour le barometre");
      return;
    }

    setSavingComprehensionSignal(true);

    try {
      const entry = await upsertComprehensionSignal(backendSalonId, {
        userId: signalUserId,
        userName: currentUser.name,
        status,
        videoId: currentVideo?.id || null,
        videoTime: currentTimeRef.current,
      });

      appendComprehensionSignal(entry);

      if (roomChannelRef.current) {
        try {
          await roomChannelRef.current.send({
            type: 'broadcast',
            event: 'room_comprehension_signal',
            payload: { entry }
          });
        } catch (broadcastError) {
          console.error("Erreur broadcast barometre comprehension", broadcastError);
        }
      }

      toast.success(
        status === "understood"
          ? "Signal comprehension envoye"
          : status === "slow_down"
            ? "Signal ralentir envoye"
            : "Signal je suis perdu envoye"
      );
    } catch (error: any) {
      console.error("Erreur sauvegarde barometre comprehension", error);
      toast.error("Barometre non enregistre dans Supabase", {
        description: error?.message || "Verifie la table session_comprehension_signals et ses policies.",
        duration: 5000,
      });
    } finally {
      setSavingComprehensionSignal(false);
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
      toast.success(`âœ… VidÃ©o "${title}" ajoutÃ©e Ã  la playlist !`);

      // â”€â”€ Feature G : alerte si contenu potentiellement inappropriÃ© â”€â”€â”€â”€â”€â”€
      if (canControlVideo) {
        const score = computeContentScore({ title, duration: "0:00" });
        if (score.alert) {
          toast.warning(`âš ï¸ Contenu Ã  vÃ©rifier : ${score.alert}`, { duration: 6000 });
        } else if (score.score < 40) {
          toast.warning(`ðŸŸ  Note faible (${score.score}/100) pour "${title}" â€” vÃ©rifiez le contenu.`, { duration: 5000 });
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur ajout vidÃ©o"));
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
        toast.success(`ðŸ—‘ï¸ VidÃ©o "${videoToRemove.title}" supprimÃ©e`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur suppression vidÃ©o"));
      console.error(error);
    }
  };

  const flushPendingPermissionUpdates = useCallback(async () => {
    if (permissionFlushInFlightRef.current) return;

    const entries = Object.entries(pendingPermissionUpdatesRef.current);
    if (entries.length === 0) return;

    pendingPermissionUpdatesRef.current = {};
    permissionFlushInFlightRef.current = true;

    let saveFailures = 0;
    const savedUpdates: Array<{
      participantId: string;
      nextPermissions: MemberPermissions;
    }> = [];

    for (const [participantId, nextPermissions] of entries) {
      try {
        await setParticipantPermissionsApi(
          backendSalonId || roomId,
          participantId,
          nextPermissions
        );
        savedUpdates.push({ participantId, nextPermissions });
      } catch (error: any) {
        saveFailures += 1;
        const msg = String(error?.message || "");
        if (msg.toLowerCase().includes("permission denied") || msg.toLowerCase().includes("row-level security")) {
          toast.error("Supabase RLS bloque la mise Ã  jour des permissions.");
        } else {
          toast.error(getErrorMessage(error, "Impossible de sauvegarder les permissions"));
        }
      }
    }

    await loadParticipantsSnapshot();

    if (savedUpdates.length > 0 && saveFailures === 0) {
      toast.success("Permissions mises à jour");
    } else if (savedUpdates.length > 0 && saveFailures > 0) {
      toast.warning("Permissions partiellement mises à jour.");
    }

    permissionFlushInFlightRef.current = false;

    if (Object.keys(pendingPermissionUpdatesRef.current).length > 0) {
      void flushPendingPermissionUpdates();
    }
  }, [backendSalonId, currentUser.id, loadParticipantsSnapshot, roomId]);

  const schedulePermissionFlush = useCallback(() => {
    if (permissionFlushTimeoutRef.current !== null) {
      window.clearTimeout(permissionFlushTimeoutRef.current);
      permissionFlushTimeoutRef.current = null;
    }
    permissionFlushTimeoutRef.current = window.setTimeout(() => {
      permissionFlushTimeoutRef.current = null;
      void flushPendingPermissionUpdates();
    }, 120);
  }, [flushPendingPermissionUpdates]);

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
        const resolvedRole = (
          participant.role ||
          participantsRef.current.find((p) => p.id === participantId)?.role ||
          "member"
        ) as SalonRole;
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

    for (const update of updates) {
      pendingPermissionUpdatesRef.current[update.participantId] = update.nextPermissions;
    }
    if (updates.length > 0) {
      schedulePermissionFlush();
    }
  };

  const broadcastVideoVotePoll = async (
    action: "start" | "vote" | "finish",
    poll: LiveVideoVotePoll
  ) => {
    if (!roomChannelRef.current) return;
    try {
      await roomChannelRef.current.send({
        type: 'broadcast',
        event: 'room_video_vote_poll',
        payload: {
          by: currentUser.id,
          action,
          poll,
        }
      });
    } catch (error) {
      console.error("Erreur broadcast vote vidÃ©o", error);
    }
  };

  const handleStartVideoVotePoll = async () => {
    if (!canManageVideoVotePoll) {
      toast.error("Seule la rÃ©gie peut lancer ce vote");
      return;
    }
    const candidates = playlist.filter((video) => !video.isCurrent);
    if (candidates.length < 1) {
      toast.error("Ajoutez d'autres vidÃ©os Ã  la playlist avant de lancer le vote");
      return;
    }

    const votes: Record<string, number> = {};
    for (const video of candidates) {
      votes[video.id] = 0;
    }

    const poll: LiveVideoVotePoll = {
      pollId: `video-poll-${Date.now()}`,
      startedAt: Date.now(),
      endsAt: Date.now() + 5 * 60 * 1000,
      isActive: true,
      startedBy: currentUser.id,
      votes,
      voterChoices: {},
      winnerVideoId: null,
    };

    setLiveVideoVotePoll(poll);
    setVideoVoteNow(Date.now());
    setShowVideoVote(true);
    await broadcastVideoVotePoll("start", poll);
    toast.success("ðŸ—³ï¸ Vote lancÃ©: 5 minutes pour choisir la prochaine vidÃ©o");
  };

  const handleVoteVideo = async (videoId: string) => {
    if (!liveVideoVotePoll?.isActive || !liveVideoVotePoll?.endsAt) {
      toast.error("Le vote n'est pas actif");
      return;
    }
    if (Date.now() >= liveVideoVotePoll.endsAt) {
      toast.error("Le vote est terminÃ©");
      return;
    }
    if (!canVoteVideoPoll) {
      toast.error("Le vote vidÃ©o n'est pas disponible pour vous");
      return;
    }

    let nextPoll: LiveVideoVotePoll | null = null;
    setLiveVideoVotePoll((prev) => {
      if (!prev?.isActive) return prev;
      if (!Object.prototype.hasOwnProperty.call(prev.votes, videoId)) return prev;
      if (prev.voterChoices[voteUserKey]) return prev;

      nextPoll = {
        ...prev,
        votes: {
          ...prev.votes,
          [videoId]: (prev.votes[videoId] || 0) + 1,
        },
        voterChoices: {
          ...prev.voterChoices,
          [voteUserKey]: videoId,
        },
      };
      return nextPoll;
    });

    if (!nextPoll) {
      toast.error("Vous avez dÃ©jÃ  votÃ© pour ce tour");
      return;
    }

    await broadcastVideoVotePoll("vote", nextPoll);
    toast.success("Vote enregistrÃ©");
  };

  // â”€â”€ Feature D/G : ouvre le panel de preview IA avant de lancer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handlePlayVideoRequest = (video: VideoInPlaylist) => {
    if (!canControlVideo) {
      toast.error("Seuls l'admin ou la regie video peuvent changer de video");
      return;
    }
    // Afficher le panel de preview pour admin/rÃ©gie
    setPreviewVideo(video);
  };

  const handlePrepareVideo = (video: VideoInPlaylist) => {
    if (!canControlVideo) {
      toast.error("Seuls l'admin ou la regie video peuvent preparer une video");
      return;
    }

    if (video.isCurrent) {
      toast.info("Cette video est deja en direct");
      return;
    }

    setPreviewVideoId(video.id);
    addRegieAction("Previsualisation", `Video preparee : ${video.title}`);
    toast.info(`Video preparee : ${video.title}`);
  };

  const handleTakePreview = async () => {
    if (!regiePreviewVideo) {
      toast.error("Aucune video en apercu");
      return;
    }

    await handlePlayVideo(regiePreviewVideo);
    addRegieAction("Passage antenne", `Video diffusee : ${regiePreviewVideo.title}`);
    setPreviewVideoId(null);
  };

  const handlePlayVideo = async (video: VideoInPlaylist, transition: VideoTransitionType = selectedVideoTransition) => {
    // Fermer le panel de preview si ouvert
    setPreviewVideo(null);

    try {
      if (!video?.id) return;
      if (!canControlVideo) {
        toast.error("Seuls l'admin ou la regie video peuvent changer de video");
        return;
      }

      await playVideoTransition(transition);

      toast.success(`Lecture de "${video.title}"`, {
        duration: 3000,
        icon: 'ðŸŽ¬',
        description: `LancÃ©e par ${currentUser.name}`,
      });

      // Basculer immÃ©diatement cÃ´tÃ© UI
      setPlaylist(prev => prev.map(v =>
        v.id === video.id ? { ...v, isCurrent: true } : { ...v, isCurrent: false }
      ));
      void broadcastRegieProgramCompletionScreen(false);
      setShowPostVideoQuestion(false);
      setCurrentTime(0);
      setIsPlaying(true);
      setSyncNonce(Date.now());
      lastAdminPlayerTimeRef.current = 0;
      addRegieAction("Changement video", `Nouvelle video lancee : ${video.title}`);

      // Admin et regie peuvent persister/synchroniser l'etat global du salon
      if (canControlVideo && backendSalonId) {
        const { error: updateError } = await updateSalonState({
          current_video_id: video.id,
          video_status: 'playing',
          video_time: 0
        });

        if (updateError) {
          // Erreur rÃ©seau ou Supabase temporairement indisponible
          // On ne bloque pas la lecture â€” la vidÃ©o joue localement
          // La synchronisation se rÃ©tablira automatiquement Ã  la reconnexion
          const isNetworkError = updateError?.message?.includes?.("Load failed") ||
            updateError?.message?.includes?.("connexion") ||
            updateError?.message?.includes?.("network") ||
            updateError?.code === "NETWORK_ERROR";

          if (isNetworkError) {
            console.warn("âš ï¸ Sync Supabase Ã©chouÃ©e (rÃ©seau) â€” lecture locale maintenue", updateError);
            toast.warning("Connexion instable â€” la vidÃ©o joue en local, la sync reprendra automatiquement.", {
              duration: 4000,
              id: "network-sync-warning",
            });
            // Ne pas throw â€” laisser la vidÃ©o continuer
          } else {
            console.error("Error updating salon video state", updateError);
            // Erreur non-rÃ©seau : on log mais on ne bloque toujours pas la lecture
            toast.warning("Sync partielle â€” la vidÃ©o joue mais les autres participants pourraient ne pas voir le changement.", {
              duration: 3000,
              id: "sync-partial-warning",
            });
          }
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
                transition,
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

    } catch (error) {
      console.error("Erreur changement vidÃ©o", error);
      toast.error("Impossible de changer la vidÃ©o");
    }
  };

  useEffect(() => {
    if (!liveVideoVotePoll) return;
    setVideoVoteCounts((prev) => ({ ...prev, ...liveVideoVotePoll.votes }));
  }, [liveVideoVotePoll]);

  useEffect(() => {
    if (!liveVideoVotePoll?.isActive || !liveVideoVotePoll.endsAt) return;
    if (liveVoteRemainingMs > 0) return;
    if (!canManageVideoVotePoll) return;
    if (videoVoteFinalizingRef.current) return;

    const pollSnapshot = liveVideoVotePoll;
    const winnerVideoId = pickWinningVideoId(pollSnapshot);
    const winnerVideo = winnerVideoId
      ? playlist.find((video) => video.id === winnerVideoId)
      : null;

    videoVoteFinalizingRef.current = true;

    const finishedPoll: LiveVideoVotePoll = {
      ...pollSnapshot,
      isActive: false,
      endsAt: null,
      winnerVideoId: winnerVideoId || null,
    };

    setLiveVideoVotePoll(finishedPoll);
    void broadcastVideoVotePoll("finish", finishedPoll);

    if (winnerVideo) {
      void handlePlayVideo(winnerVideo);
      toast.success(`ðŸŽ¬ Vote terminÃ©: "${winnerVideo.title}" est sÃ©lectionnÃ©e`);
    } else {
      toast.warning("Vote terminÃ©: aucune vidÃ©o gagnante");
    }

    videoVoteFinalizingRef.current = false;
  }, [
    liveVideoVotePoll,
    liveVoteRemainingMs,
    canManageVideoVotePoll,
    pickWinningVideoId,
    playlist,
  ]);

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
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Erreur ajout multiple de videos"));
      console.error(error);
    }
  };

  const clearHoverPreviewTimeout = () => {
    if (hoverPreviewTimeoutRef.current !== null) {
      window.clearTimeout(hoverPreviewTimeoutRef.current);
      hoverPreviewTimeoutRef.current = null;
    }
  };

  const getHoverPreviewUrl = (youtubeId: string) =>
    `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&start=12&end=18&disablekb=1&iv_load_policy=3&fs=0`;

  const startHoverPreview = (videoId: string) => {
    clearHoverPreviewTimeout();
    setHoverPreviewVideoId(videoId);
    hoverPreviewTimeoutRef.current = window.setTimeout(() => {
      setHoverPreviewVideoId((current) => (current === videoId ? null : current));
      hoverPreviewTimeoutRef.current = null;
    }, 6000);
  };

  const stopHoverPreview = () => {
    clearHoverPreviewTimeout();
    setHoverPreviewVideoId(null);
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

  useEffect(() => {
    return () => {
      if (hoverPreviewTimeoutRef.current !== null) {
        window.clearTimeout(hoverPreviewTimeoutRef.current);
        hoverPreviewTimeoutRef.current = null;
      }
      if (videoTransitionTimeoutRef.current !== null) {
        window.clearTimeout(videoTransitionTimeoutRef.current);
        videoTransitionTimeoutRef.current = null;
      }
      if (permissionFlushTimeoutRef.current !== null) {
        window.clearTimeout(permissionFlushTimeoutRef.current);
        permissionFlushTimeoutRef.current = null;
      }
      if (regieProgramAdvanceTimeoutRef.current !== null) {
        window.clearTimeout(regieProgramAdvanceTimeoutRef.current);
        regieProgramAdvanceTimeoutRef.current = null;
      }
    };
  }, []);

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

  // â”€â”€ Scene switcher â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSceneChange = async (scene: SceneMode) => {
    setCurrentScene(scene);
    if (!roomChannelRef.current) return;
    try {
      await roomChannelRef.current.send({
        type: 'broadcast',
        event: 'room_scene_change',
        payload: { scene, by: currentUser.id },
      });
      const sceneLabels: Record<SceneMode, string> = {
        cinema: "ðŸŽ¬ Mode CinÃ©ma",
        split: "â–£ Mode Split",
        party: "ðŸ‘¥ Watch Party",
        interlude: "â¸ Interlude",
      };
      toast.success(`ScÃ¨ne : ${sceneLabels[scene]}`);
    } catch (err) {
      console.error("Erreur broadcast scÃ¨ne", err);
    }
  };

  // â”€â”€ Feature 68 : Lancer le compte Ã  rebours â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleLaunchCountdown = async (seconds: number, reason: "manual" | "startup" = "manual") => {
    // Show locally for the rÃ©gie too
    if (reason === "startup") {
      startupCountdownTriggeredRef.current = true;
    }
    setActiveCountdown({ seconds, key: Date.now(), reason });
    if (!roomChannelRef.current) return;
    try {
      await roomChannelRef.current.send({
        type: 'broadcast',
        event: 'room_countdown',
        payload: { seconds, by: currentUser.id, reason },
      });
    } catch (err) {
      console.error("Erreur broadcast countdown", err);
    }
  };

  const clearRegieProgramAdvanceTimeout = () => {
    if (regieProgramAdvanceTimeoutRef.current !== null) {
      window.clearTimeout(regieProgramAdvanceTimeoutRef.current);
      regieProgramAdvanceTimeoutRef.current = null;
    }
  };

  const completeRegieProgram = () => {
    clearRegieProgramAdvanceTimeout();
    regieProgramStatusRef.current = "idle";
    regieProgramCurrentStepIndexRef.current = null;
    regieProgramWaitingForVideoEndRef.current = false;
    setRegieProgramStatus("idle");
    setRegieProgramCurrentStepIndex(null);
    setRegieProgramWaitingForVideoEnd(false);
    void broadcastRegieProgramCompletionScreen(true, REGIE_PROGRAM_COMPLETION_MESSAGE);
    addRegieAction("Programme regie", "Programme termine");
    toast.success("Programme regie termine");
  };

  const stopRegieProgram = (details = "Programme arrete") => {
    clearRegieProgramAdvanceTimeout();
    regieProgramStatusRef.current = "idle";
    regieProgramCurrentStepIndexRef.current = null;
    regieProgramWaitingForVideoEndRef.current = false;
    setRegieProgramStatus("idle");
    setRegieProgramCurrentStepIndex(null);
    setRegieProgramWaitingForVideoEnd(false);
    addRegieAction("Programme regie", details);
  };

  const scheduleRegieProgramContinuation = (
    nextIndex: number,
    delayMs: number,
    beforeContinue?: () => Promise<void> | void
  ) => {
    clearRegieProgramAdvanceTimeout();
    regieProgramAdvanceTimeoutRef.current = window.setTimeout(async () => {
      if (regieProgramStatusRef.current !== "running") return;

      if (beforeContinue) {
        try {
          await beforeContinue();
        } catch (error) {
          console.error("Erreur lors de la continuation du programme regie", error);
          stopRegieProgram("Programme interrompu apres une erreur");
          toast.error("Le programme regie a rencontre une erreur");
          return;
        }
        if (regieProgramStatusRef.current !== "running") return;
      }

      if (nextIndex >= regieProgramStepsRef.current.length) {
        completeRegieProgram();
        return;
      }
      void executeRegieProgramStepRef.current?.(nextIndex);
    }, Math.max(0, delayMs));
  };

  const continueRegieProgramAfterPostVideoQuestion = () => {
    if (!regieProgramWaitingForVideoEndRef.current) return;

    regieProgramWaitingForVideoEndRef.current = false;
    setRegieProgramWaitingForVideoEnd(false);

    if (regieProgramStatusRef.current !== "running") return;

    const nextIndex = (regieProgramCurrentStepIndexRef.current ?? -1) + 1;
    if (nextIndex >= regieProgramStepsRef.current.length) {
      completeRegieProgram();
      return;
    }

    scheduleRegieProgramContinuation(nextIndex, REGIE_PROGRAM_STEP_BUFFER_MS);
  };

  const executeRegieProgramStep = useCallback(async (stepIndex: number) => {
    if (regieProgramStatusRef.current !== "running") return;

    const steps = regieProgramStepsRef.current;
    if (stepIndex < 0 || stepIndex >= steps.length) {
      completeRegieProgram();
      return;
    }

    const step = steps[stepIndex];
    regieProgramCurrentStepIndexRef.current = stepIndex;
    regieProgramWaitingForVideoEndRef.current = false;
    setRegieProgramCurrentStepIndex(stepIndex);
    setRegieProgramWaitingForVideoEnd(false);

    if (step.type === "announcement") {
      const announcementDurationMs = Math.max(1, step.durationSeconds) * 1000;
      await broadcastAnnouncement(step.message, announcementDurationMs);
      addRegieAction("Programme regie", `Etape ${stepIndex + 1} : annonce diffusee (${step.durationSeconds}s)`);
      scheduleRegieProgramContinuation(stepIndex + 1, announcementDurationMs + REGIE_PROGRAM_STEP_BUFFER_MS);
      return;
    }

    if (step.type === "pause") {
      await handleApplyInterlude({
        enabled: true,
        message: step.message,
        durationMinutes: Math.max(1, step.durationSeconds) / 60,
      }, {
        persist: false,
        quiet: true,
        trackHistory: false,
      });
      addRegieAction("Programme regie", `Etape ${stepIndex + 1} : pause ${formatVideoTimeLabel(step.durationSeconds)}`);
      scheduleRegieProgramContinuation(
        stepIndex + 1,
        step.durationSeconds * 1000 + REGIE_PROGRAM_STEP_BUFFER_MS,
        async () => {
          await handleApplyInterlude({
            enabled: false,
            message: step.message,
            durationMinutes: 0,
          }, {
            persist: false,
            quiet: true,
            trackHistory: false,
          });
        }
      );
      return;
    }

    if (step.type === "countdown") {
      await handleLaunchCountdown(step.seconds, "manual");
      addRegieAction("Programme regie", `Etape ${stepIndex + 1} : compte a rebours ${step.seconds}s`);
      scheduleRegieProgramContinuation(stepIndex + 1, step.seconds * 1000 + REGIE_PROGRAM_STEP_BUFFER_MS);
      return;
    }

    const video = playlistRef.current.find((entry) => entry.id === step.videoId);
    if (!video) {
      toast.error("Une video du programme est introuvable dans la playlist");
      addRegieAction("Programme regie", `Etape ${stepIndex + 1} ignoree : video introuvable`);
      scheduleRegieProgramContinuation(stepIndex + 1, REGIE_PROGRAM_STEP_BUFFER_MS);
      return;
    }

    regieProgramWaitingForVideoEndRef.current = true;
    setRegieProgramWaitingForVideoEnd(true);
    addRegieAction("Programme regie", `Etape ${stepIndex + 1} : video ${video.title}`);
    await handlePlayVideo(video);
  }, [broadcastAnnouncement, handleApplyInterlude, handleLaunchCountdown, handlePlayVideo]);

  executeRegieProgramStepRef.current = executeRegieProgramStep;

  const handleAddRegieProgramStep = (draft: RegieProgramStepDraft) => {
    const nextStep: RegieProgramStep =
      draft.type === "announcement"
        ? {
            id: createClientUuid(),
            type: "announcement",
            message: draft.message,
            durationSeconds: Math.max(1, draft.durationSeconds),
          }
        : draft.type === "pause"
          ? {
              id: createClientUuid(),
              type: "pause",
              message: draft.message,
              durationSeconds: Math.max(1, draft.durationSeconds),
            }
        : draft.type === "countdown"
          ? { id: createClientUuid(), type: "countdown", seconds: draft.seconds }
          : { id: createClientUuid(), type: "video", videoId: draft.videoId };

    setRegieProgramSteps((prev) => [...prev, nextStep]);
  };

  const handleRemoveRegieProgramStep = (stepId: string) => {
    setRegieProgramSteps((prev) => prev.filter((step) => step.id !== stepId));
  };

  const handleMoveRegieProgramStep = (stepId: string, direction: "up" | "down") => {
    setRegieProgramSteps((prev) => {
      const index = prev.findIndex((step) => step.id === stepId);
      if (index === -1) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const handleStartRegieProgram = () => {
    if (!canControlVideo) {
      toast.error("Seuls l'admin ou la regie video peuvent lancer le programme");
      return;
    }
    if (regieProgramStepsRef.current.length === 0) {
      toast.error("Ajoute au moins une etape au programme");
      return;
    }

    clearRegieProgramAdvanceTimeout();
    regieProgramStatusRef.current = "running";
    regieProgramCurrentStepIndexRef.current = null;
    regieProgramWaitingForVideoEndRef.current = false;
    setRegieProgramStatus("running");
    setRegieProgramCurrentStepIndex(null);
    setRegieProgramWaitingForVideoEnd(false);
    void broadcastRegieProgramCompletionScreen(false);
    addRegieAction("Programme regie", "Programme lance");
    void executeRegieProgramStep(0);
  };

  const handlePauseRegieProgram = () => {
    if (regieProgramStatusRef.current !== "running") return;
    clearRegieProgramAdvanceTimeout();
    regieProgramStatusRef.current = "paused";
    setRegieProgramStatus("paused");
    addRegieAction("Programme regie", "Programme mis en pause");
    toast.info("Programme regie en pause");
  };

  const handleResumeRegieProgram = () => {
    if (regieProgramStatusRef.current !== "paused") return;

    regieProgramStatusRef.current = "running";
    setRegieProgramStatus("running");
    addRegieAction("Programme regie", "Programme repris");

    if (regieProgramWaitingForVideoEndRef.current) {
      toast.info("Programme regie repris");
      return;
    }

    const currentIndex = regieProgramCurrentStepIndexRef.current;
    const nextIndex = currentIndex === null ? 0 : currentIndex + 1;
    scheduleRegieProgramContinuation(nextIndex, REGIE_PROGRAM_STEP_BUFFER_MS);
    toast.info("Programme regie repris");
  };

  const handleStopRegieProgram = () => {
    if (regieProgramStatusRef.current === "idle" && regieProgramCurrentStepIndexRef.current === null) return;

    const currentStep =
      regieProgramCurrentStepIndexRef.current !== null
        ? regieProgramStepsRef.current[regieProgramCurrentStepIndexRef.current] || null
        : null;

    if (currentStep?.type === "pause" && sessionInterlude.enabled) {
      void handleApplyInterlude({
        enabled: false,
        message: sessionInterlude.message || currentStep.message,
        durationMinutes: 0,
      }, {
        persist: false,
        quiet: true,
        trackHistory: false,
      });
    }

    stopRegieProgram("Programme arrete manuellement");
    toast.info("Programme regie arrete");
  };

  useEffect(() => {
    if (!backendSalonId || !UUID_REGEX.test(backendSalonId)) return;
    if (!isAdmin) return;
    if (startupCountdownTriggeredRef.current) return;

    const timeout = window.setTimeout(() => {
      void handleLaunchCountdown(3, "startup");
    }, 1200);

    return () => window.clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendSalonId, isAdmin]);

  const handleCountdownFinished = () => {
    const finishedReason = activeCountdown?.reason;
    setActiveCountdown(null);
    if (finishedReason === "startup" && isAdmin) {
      toast.success("GO ! Lancez la vidÃ©o quand vous Ãªtes prÃªt.");
    }
  };

  // â”€â”€ Feature 70 : Diffuser une annonce TTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleTTSAnnounce = async (text: string) => {
    if (!roomChannelRef.current) return;
    try {
      await roomChannelRef.current.send({
        type: 'broadcast',
        event: 'room_tts_announce',
        payload: { text, by: currentUser.id },
      });
    } catch (err) {
      console.error("Erreur broadcast TTS", err);
    }
  };

  useEffect(() => {
    if (!voiceCommentaryEnabled) return;
    if (!canManageVoiceCommentary) return;
    if (!localVoiceStreamRef.current) return;

    const targets = participants
      .filter((participant) =>
        participant.status === "online" &&
        participant.id !== currentUser.id &&
        participant.id !== authUserId &&
        participant.email !== currentUser.email &&
        participant.name !== currentUser.name
      )
      .map((participant) => participant.id)
      .filter(Boolean);

    for (const peerId of targets) {
      if (voicePeerConnectionsRef.current[peerId]) continue;
      void connectVoiceToPeer(peerId);
    }
  }, [
    authUserId,
    canManageVoiceCommentary,
    connectVoiceToPeer,
    currentUser.email,
    currentUser.id,
    currentUser.name,
    participants,
    voiceCommentaryEnabled,
  ]);

  useEffect(() => {
    return () => {
      teardownVoiceInfrastructure();
    };
  }, [teardownVoiceInfrastructure]);

  const handleToggleVoiceCommentary = async () => {
    if (!canManageVoiceCommentary) {
      toast.error("Seule la rÃ©gie peut contrÃ´ler la voix live");
      return;
    }
    if (voiceCommentaryEnabled) {
      await stopVoiceCommentary(true);
      toast.info("Micro commentaire dÃ©sactivÃ©");
      return;
    }
    await startVoiceCommentary();
  };

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
      toast.success(enabled ? "ðŸŽ¬ RÃ´le RÃ©gie vidÃ©o attribuÃ©" : "RÃ´le RÃ©gie vidÃ©o retirÃ©");
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Impossible de mettre a jour le role"));
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <audio ref={remoteVoiceAudioRef} autoPlay playsInline className="hidden" />
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

            {activeSpeakerRequest && (
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 px-3 py-1 flex items-center gap-1.5">
                <Mic className="w-3 h-3" />
                {activeSpeakerRequest.participantId === speakingRequestParticipantId
                  ? "Vous avez la parole"
                  : `${activeSpeakerRequest.participantName} a la parole`}
              </Badge>
            )}

            {canManageSpeakingRequests ? (
              <button
                type="button"
                onClick={() => setShowSpeakingRequests(true)}
                title="Demandes de parole"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.35rem 0.65rem",
                  borderRadius: "0.5rem",
                  border: theme === "dark" ? "1px solid #3f3f46" : "1px solid #d4d4d8",
                  background: theme === "dark" ? "rgba(39,39,42,0.8)" : "rgba(255,255,255,0.8)",
                  color: theme === "dark" ? "#f4f4f5" : "#18181b",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                }}
              >
                <Users style={{ width: 14, height: 14 }} />
                Parole
                {speakingQueueCount > 0 && (
                  <span
                    style={{
                      minWidth: "1.25rem",
                      height: "1.25rem",
                      padding: "0 0.35rem",
                      borderRadius: "999px",
                      background: "#dc2626",
                      color: "white",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {speakingQueueCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (isCurrentParticipantActiveSpeaker) return;
                  void (hasRaisedHand ? handleLowerHand() : handleRaiseHand());
                }}
                disabled={isCurrentParticipantActiveSpeaker}
                title={isCurrentParticipantActiveSpeaker ? "Vous avez la parole" : "Demander la parole"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.35rem 0.65rem",
                  borderRadius: "0.5rem",
                  border: isCurrentParticipantActiveSpeaker
                    ? "1px solid #10b981"
                    : hasRaisedHand
                      ? "1px solid #dc2626"
                      : theme === "dark" ? "1px solid #3f3f46" : "1px solid #d4d4d8",
                  background: isCurrentParticipantActiveSpeaker
                    ? "rgba(16,185,129,0.12)"
                    : hasRaisedHand
                      ? "rgba(220,38,38,0.12)"
                      : theme === "dark" ? "rgba(39,39,42,0.8)" : "rgba(255,255,255,0.8)",
                  color: isCurrentParticipantActiveSpeaker
                    ? "#10b981"
                    : hasRaisedHand ? "#ef4444" : theme === "dark" ? "#f4f4f5" : "#18181b",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: isCurrentParticipantActiveSpeaker ? "default" : "pointer",
                  opacity: isCurrentParticipantActiveSpeaker ? 0.9 : 1,
                  backdropFilter: "blur(4px)",
                }}
              >
                <Users style={{ width: 14, height: 14 }} />
                {isCurrentParticipantActiveSpeaker
                  ? "Vous avez la parole"
                  : hasRaisedHand
                    ? currentSpeakingRequestPosition >= 0
                      ? `Main levee #${currentSpeakingRequestPosition + 1}`
                      : "Main levee"
                    : "Lever la main"}
              </button>
            )}

            {/* Scene Switcher â€” visible only for admin/regie */}
            <SceneSwitcher
              currentScene={currentScene}
              onSceneChange={handleSceneChange}
              theme={theme}
              canControl={isAdmin || effectiveRole === "regie"}
            />

            {(isAdmin || effectiveRole === "regie") && (
              <select
                value={selectedVideoTransition}
                onChange={(e) => setSelectedVideoTransition(e.target.value as VideoTransitionType)}
                title="Transition entre vidÃ©os"
                className={`h-8 rounded-md border px-2 text-xs font-medium outline-none ${
                  theme === "dark"
                    ? "border-zinc-700 bg-zinc-900 text-zinc-200"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                {VIDEO_TRANSITIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            )}

            {/* â”€â”€ Feature 70 : Annonce TTS â€” admin/regie uniquement â”€â”€ */}
            {(isAdmin || effectiveRole === "regie") && (
              <button
                id="voice-commentary-btn"
                onClick={() => {
                  void handleToggleVoiceCommentary();
                }}
                title={voiceCommentaryEnabled ? "Couper la voix live" : "Activer la voix live"}
                disabled={voiceCommentaryBusy}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.35rem 0.65rem",
                  borderRadius: "0.5rem",
                  border: voiceCommentaryEnabled
                    ? "1px solid #ef4444"
                    : theme === "dark" ? "1px solid #3f3f46" : "1px solid #d4d4d8",
                  background: voiceCommentaryEnabled
                    ? "rgba(239,68,68,0.15)"
                    : theme === "dark" ? "rgba(39,39,42,0.8)" : "rgba(255,255,255,0.8)",
                  color: voiceCommentaryEnabled ? "#ef4444" : theme === "dark" ? "#fca5a5" : "#dc2626",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: voiceCommentaryBusy ? "not-allowed" : "pointer",
                  opacity: voiceCommentaryBusy ? 0.6 : 1,
                  backdropFilter: "blur(4px)",
                  transition: "all 0.15s",
                }}
              >
                {voiceCommentaryEnabled ? (
                  <MicOff style={{ width: 14, height: 14 }} />
                ) : (
                  <Mic style={{ width: 14, height: 14 }} />
                )}
                {voiceCommentaryEnabled ? "Voix ON" : "Voix"}
              </button>
            )}

            {(isAdmin || effectiveRole === "regie") && (
              <button
                id="tts-announce-btn"
                onClick={() => setShowTTSPanel((v) => !v)}
                title="Annonce vocale pour tous"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.35rem 0.65rem",
                  borderRadius: "0.5rem",
                  border: showTTSPanel
                    ? "1px solid #8b5cf6"
                    : theme === "dark" ? "1px solid #3f3f46" : "1px solid #d4d4d8",
                  background: showTTSPanel
                    ? "rgba(139,92,246,0.15)"
                    : theme === "dark" ? "rgba(39,39,42,0.8)" : "rgba(255,255,255,0.8)",
                  color: showTTSPanel ? "#8b5cf6" : theme === "dark" ? "#a78bfa" : "#7c3aed",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.15s",
                }}
              >
                <Volume2 style={{ width: 14, height: 14 }} />
                TTS
              </button>
            )}

            {!canManageVoiceCommentary && voiceCommentaryEnabled && (
              <Badge className="bg-red-600 text-white hover:bg-red-600 px-2 py-1 text-[11px]">
                ðŸŽ™ï¸ Commentaire vocal live
              </Badge>
            )}
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

          {/* Bouton Contenu du Salon â€” rÃ©sumÃ©s IA de toutes les vidÃ©os */}
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowContentPanel(true);
            }}
            variant="ghost"
            size="sm"
            className={`text-sm h-9 transition-all ${
              showContentPanel
                ? "text-purple-400 bg-purple-600/15 hover:bg-purple-600/25"
                : theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-zinc-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
            title="Contenu du Salon â€” RÃ©sumÃ©s IA de toutes les vidÃ©os"
          >
            <LayoutList className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Contenu</span>
          </Button>
          {isInterludeVisible && (
            <Badge className="bg-amber-400 text-black hover:bg-amber-400">
              <Sparkles className="mr-1 h-3 w-3" />
              Interlude actif
            </Badge>
          )}

          {canControlVideo && lostComprehensionCount > 0 && (
            <Badge className="bg-red-600 text-white hover:bg-red-600">
              <AlertTriangle className="mr-1 h-3 w-3" />
              {lostComprehensionCount} perdu{lostComprehensionCount > 1 ? "s" : ""}
            </Badge>
          )}

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

      {/* Main Content - layout conditionnel selon currentScene */}
      <div
        className={`flex gap-4 p-4 ${
          currentScene === "cinema" ? "flex-col" : ""
        }`}
      >
        {/* LEFT: Video + Playlist */}
        <div
          className={`space-y-6 ${
            currentScene === "cinema" ? "w-full" : "flex-1"
          }`}
        >
          {/* Video Player â€” ou InterludeScreen si scÃ¨ne interlude */}
          {currentScene === "interlude" ? (
            <InterludeScreen roomName={roomName} theme={theme} />
          ) : currentVideo && currentVideo.youtubeId ? (
            <div className="relative">
              <YouTubePlayer
                videoId={currentVideo.youtubeId}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                canControl={canControlVideo}
                syncTime={currentTime}
                syncNonce={syncNonce}
                onTimeUpdate={handlePlayerTimeUpdate}
                onPlaybackStateChange={handleAdminPlaybackStateChange}
                onEnded={handleMainVideoEnded}
                theme={theme}
              />
              {/* Feature F â€” Overlay de sous-titres (YouTube captions + micro fallback) */}
              <LiveTranscriptionOverlay
                isActive={transcription.isActive}
                captionLine={ytCaptions.currentCaption}
                captionsAvailable={ytCaptions.isAvailable}
                captionsLoading={ytCaptions.isLoading}
                captionsLanguage={ytCaptions.language}
                isListening={transcription.isListening}
                words={transcription.words}
                micError={transcription.error}
                isSupported={transcription.isSupported}
              />

              {liveAnnouncement && (
                <div className="pointer-events-none absolute left-4 right-4 top-4 z-20 flex justify-center">
                  <div className="max-w-3xl rounded-md border border-red-400/40 bg-red-600/95 px-4 py-2 shadow-xl backdrop-blur">
                    <p className="truncate text-center text-sm font-semibold text-white">
                      <span className="mr-2 text-white/80">ANNONCE REGIE</span>
                      {liveAnnouncement}
                    </p>
                  </div>
                </div>
              )}

              {showPostVideoQuestion && postVideoQuestion && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-6">
                  <div className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'} w-full max-w-xl rounded-xl border p-5 shadow-2xl`}>
                    <p className={`${theme === 'dark' ? 'text-red-400' : 'text-red-600'} text-xs font-semibold`}>
                      QUESTION APRES VIDEO
                    </p>
                    <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} mt-2 text-lg font-semibold`}>
                      {postVideoQuestion}
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                      {canControlVideo && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleClearPostVideoQuestion}
                          className={`${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-zinc-800' : 'text-gray-700 hover:text-black hover:bg-gray-100'}`}
                        >
                          Retirer
                        </Button>
                      )}
                      <Button
                        type="button"
                        onClick={handleClosePostVideoQuestion}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Fermer
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {regieProgramCompletionScreen.visible && (
                <div className="absolute inset-0 z-40 overflow-hidden rounded-xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.16),transparent_28%)]" />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-zinc-950/95 to-red-950/75 backdrop-blur-sm" />
                  <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-red-500/15 blur-3xl" />
                  <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-amber-300/10 blur-3xl" />

                  <div className="relative flex h-full items-center justify-center p-6 sm:p-10">
                    <div className="max-w-3xl text-center">
                      <Badge className="bg-red-600 text-white hover:bg-red-600">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Seance terminee
                      </Badge>
                      <p className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                        {regieProgramCompletionScreen.message || REGIE_PROGRAM_COMPLETION_MESSAGE}
                      </p>
                      <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-300 sm:text-base">
                        Merci pour votre attention. Vous pouvez quitter le salon ou attendre la prochaine diffusion.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {isInterludeVisible && (
              <div className="absolute inset-0 z-30 overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.18),transparent_28%)]" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-zinc-950/95 to-red-950/75 backdrop-blur-sm" />
                <div className="absolute -left-12 top-10 h-36 w-36 rounded-full bg-red-500/15 blur-3xl" />
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />

                <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge className="bg-red-600 text-white hover:bg-red-600">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Interlude en cours
                      </Badge>
                      <p className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                        {sessionInterlude.message || "Pause en cours - reprise tres bientot"}
                      </p>
                      <p className="mt-3 max-w-xl text-sm text-gray-300 sm:text-base">
                        La regie a mis la projection en pause. Profitez de ce temps pour respirer, puis reprenez la seance au prochain signal.
                      </p>
                    </div>

                    {canControlVideo && (
                      <Button
                        type="button"
                        onClick={() =>
                          void handleApplyInterlude({
                            enabled: false,
                            message: sessionInterlude.message || "",
                            durationMinutes: 0,
                          })
                        }
                        className="bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Reprendre
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md">
                      <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Compte a rebours</p>
                      <p className="mt-2 text-4xl font-semibold text-white sm:text-6xl">
                        {interludeRemainingSeconds !== null
                          ? formatVideoTimeLabel(interludeRemainingSeconds)
                          : "--:--"}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/25 px-5 py-4 text-sm text-gray-300 backdrop-blur-md">
                      <p>{sessionInterlude.updatedBy ? `Mis a jour par ${sessionInterlude.updatedBy}` : "Annonce de la regie"}</p>
                      <p className="mt-1 text-gray-400">
                        {interludeRemainingSeconds !== null
                          ? "La reprise se fera a la fin du timer ou manuellement par la regie."
                          : "L'interlude restera visible jusqu'a ce que la regie le coupe."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
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

          {canControlVideo && regiePreviewVideo?.youtubeId && (
            <div className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-100 border-gray-200'} border rounded-xl p-3`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-36 shrink-0 overflow-hidden rounded bg-black">
                    <YouTubePlayer
                      videoId={regiePreviewVideo.youtubeId}
                      isPlaying={true}
                      onPlayPause={() => {}}
                      canControl={false}
                      theme={theme}
                      muted={true}
                      label="Apercu regie"
                      showPlayButton={false}
                      showBadge={false}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className={`${theme === 'dark' ? 'text-red-400' : 'text-red-600'} text-xs font-semibold`}>
                      APERCU REGIE
                    </p>
                    <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-sm font-medium truncate`}>
                      {regiePreviewVideo.title}
                    </p>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                      Prete a etre diffusee
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleTakePreview}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Passer a l'antenne
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setPreviewVideoId(null)}
                    className={`${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-zinc-800' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Playlist Section â€” cachÃ©e en mode cinÃ©ma */}
        {/* LEFT: Video + Playlist - 2/3 de l'écran */}
          {/* Video Player */}

          {/* Playlist Section — cachée en mode cinéma */}
          {currentScene !== "cinema" && (
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
                  {playlist.map((video) => {
                    return (
                    <div
                      key={video.id}
                      onMouseEnter={() => {
                        if (video.youtubeId) startHoverPreview(video.id);
                      }}
                      onMouseLeave={stopHoverPreview}
                      onClick={() => {
                        if (canControlVideo) {
                          handlePlayVideoRequest(video);
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
                      {video.youtubeId && hoverPreviewVideoId === video.id && (
                        <iframe
                          src={getHoverPreviewUrl(video.youtubeId)}
                          title={`AperÃ§u ${video.title}`}
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          allow="autoplay; encrypted-media; picture-in-picture"
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      )}

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

                      {canControlVideo && !video.isCurrent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrepareVideo(video);
                          }}
                          className="absolute bottom-1.5 right-1.5 rounded bg-red-600/90 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700"
                        >
                          Preparer
                        </button>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                        <p className="text-white text-[11px] truncate leading-tight">{video.title}</p>
                        <p className="text-gray-400 text-[10px] mt-0.5">{video.duration}</p>
                      </div>

                      <div className="absolute top-1.5 left-1.5 right-9 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-black/65 rounded px-2 py-1">
                          <p className="text-white text-[11px] leading-tight whitespace-normal break-words">{video.title}</p>
                          <p className="text-gray-300 text-[10px] mt-0.5">AperÃ§u 6s</p>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Chat + Participants â€” masquÃ© en mode cinÃ©ma, participants-only en mode party */}
        {currentScene !== "cinema" && (
        <div className={`w-80 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'} rounded-xl flex flex-col sticky top-20 h-[calc(100vh-6rem)]`}>

          {/* â”€â”€ MODE PARTY : uniquement la liste des participants â”€â”€ */}
          {currentScene === "party" ? (
            <>
              {/* Header party */}
              <div className={`flex items-center gap-2 px-4 py-3 border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-300'}`}>
                <Users className="w-4 h-4 text-green-400" />
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  Watch Party
                </span>
                <span className={`ml-auto text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {participantCount} en ligne
                </span>
              </div>

              {/* Liste participants */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* Soi-mÃªme */}
                <div className={`p-3 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'} rounded-xl`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-sm font-medium flex items-center gap-2`}>
                          {currentUser.name}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${theme === 'dark' ? 'bg-zinc-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>Vous</span>
                          {isAdmin && <Crown className="w-3 h-3 text-yellow-500" />}
                        </p>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                          {getRoleLabel(effectiveRole)}
                        </p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                </div>

                {/* Autres participants */}
                {otherParticipants.length === 0 ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-sm`}>
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Aucun autre participant
                  </div>
                ) : (
                  otherParticipants.map((participant) => (
                    <div key={participant.id} className={`p-3 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'} rounded-xl`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-sm font-medium flex items-center gap-2`}>
                              {participant.name}
                              {participant.role === "admin" && <Crown className="w-3 h-3 text-yellow-500" />}
                              {participant.role === "regie" && <Clapperboard className="w-3 h-3 text-red-400" />}
                            </p>
                            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                              {getRoleLabel(participant.role)}
                            </p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${participant.status === "online" ? "bg-green-500" : "bg-gray-500"}`} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* â”€â”€ MODES split / interlude : tabs Chat / Participants / Sondages â”€â”€ */
            <>
          <div className={`flex border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-300'}`}>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 min-w-0 px-3 py-3 text-xs transition-colors flex items-center justify-center gap-2 ${activeTab === "chat"
                ? "bg-red-600 text-white"
                : theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="truncate">Chat</span>
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`flex-1 min-w-0 px-3 py-3 text-xs transition-colors flex items-center justify-center gap-2 ${activeTab === "participants"
                ? "bg-red-600 text-white"
                : theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                }`}
            >
              <Users className="w-4 h-4" />
              <span className="truncate">Participants ({participantCount})</span>
            </button>
            <button
              onClick={() => setActiveTab("barometer")}
              className={`flex-1 min-w-0 px-3 py-3 text-xs transition-colors flex items-center justify-center gap-2 ${activeTab === "barometer"
                ? "bg-red-600 text-white"
                : theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                }`}
            >
              <Gauge className="w-4 h-4" />
              <span className="truncate">
                Baro
                {canControlVideo && lostComprehensionCount > 0 ? ` (${lostComprehensionCount})` : ""}
              </span>
            </button>
            <button
              onClick={() => {
                if (!canUsePolls) {
                  toast.error("Les sondages sont dÃ©sactivÃ©s pour vous");
                  return;
                }
                setActiveTab("polls");
              }}
              className={`flex-1 min-w-0 px-3 py-3 text-xs transition-colors flex items-center justify-center gap-2 ${activeTab === "polls"
                ? "bg-red-600 text-white"
                : theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="truncate">Sondages</span>
            </button>
          </div>

          {activeTab === "chat" && (
            <>
              {/* Feature E : Questions de discussion IA */}
              {discussionQuestions && discussionVideoTitle && (
                <div className="px-3 pt-3">
                  <AIDiscussionQuestions
                    questions={discussionQuestions}
                    videoTitle={discussionVideoTitle}
                    onSendQuestion={(q) => {
                      setNewMessage(q);
                      // Auto-envoyer dans le chat
                      setTimeout(() => {
                        const el = document.getElementById('chat-input-field');
                        if (el) el.focus();
                      }, 50);
                    }}
                    theme={theme}
                  />
                </div>
              )}
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
                      disabled={!canUseChat}
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
                    id="chat-input-field"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    autoComplete="off"
                    placeholder={canUseChat ? "Message..." : "Chat dÃ©sactivÃ©"}
                    disabled={!canUseChat}
                    className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-black placeholder:text-gray-400'} flex-1 text-sm h-9`}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!canUseChat}
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
                          {hasRaisedHand && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                              Main levee
                            </span>
                          )}
                          {activeSpeakerRequest?.participantId === speakingRequestParticipantId && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">
                              Parole
                            </span>
                          )}
                        </p>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                          {getRoleLabel(effectiveRole)}
                        </p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                {(activeSpeakerRequest || speakingQueueCount > 0 || hasRaisedHand) && (
                  <div className={`p-3 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'} rounded-lg`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-sm font-medium`}>
                          Demandes de parole
                        </p>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs mt-1`}>
                          {canManageSpeakingRequests
                            ? speakingQueueCount > 0
                              ? `${speakingQueueCount} participant(s) en attente`
                              : activeSpeakerRequest
                                ? `${activeSpeakerRequest.participantName} a la parole`
                                : "Aucune main levee pour le moment"
                            : activeSpeakerRequest?.participantId === speakingRequestParticipantId
                              ? "La regie vous a donne la parole."
                              : hasRaisedHand
                                ? currentSpeakingRequestPosition >= 0
                                  ? `Vous etes en attente (#${currentSpeakingRequestPosition + 1})`
                                  : "Votre demande est en attente"
                                : activeSpeakerRequest
                                  ? `${activeSpeakerRequest.participantName} a la parole actuellement`
                                  : "Vous pouvez lever la main pour demander la parole"}
                        </p>
                      </div>

                      {canManageSpeakingRequests ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setShowSpeakingRequests(true)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Ouvrir
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isCurrentParticipantActiveSpeaker}
                          onClick={() => {
                            if (isCurrentParticipantActiveSpeaker) return;
                            void (hasRaisedHand ? handleLowerHand() : handleRaiseHand());
                          }}
                          className={`${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-zinc-700' : 'text-gray-700 hover:text-black hover:bg-gray-100'}`}
                        >
                          {isCurrentParticipantActiveSpeaker
                            ? "Vous avez la parole"
                            : hasRaisedHand ? "Annuler" : "Lever la main"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

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
                              {speakingRequests[participant.id] && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                                  Main levee
                                </span>
                              )}
                              {activeSpeakerRequest?.participantId === participant.id && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">
                                  Parole
                                </span>
                              )}
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
          {activeTab === "barometer" && (
            <div className="flex-1 overflow-hidden h-full">
              <ComprehensionBarometerPanel
                signals={activeComprehensionSignals}
                currentSignal={currentUserSignal}
                onSignal={handleSubmitComprehensionSignal}
                saving={savingComprehensionSignal}
                isTeacherView={canControlVideo}
                onlineLearnerCount={onlineLearnerParticipants.length}
                currentVideoTitle={currentVideo?.title}
                theme={theme}
                formatTimeLabel={formatVideoTimeLabel}
              />
            </div>
          )}
          {activeTab === "polls" && backendSalonId && canUsePolls && (
            <div className="flex-1 overflow-hidden h-full flex flex-col">
              <div className={`px-3 py-2 border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-300'} flex items-center justify-between`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  ðŸ—³ï¸ Vote vidÃ©o en temps rÃ©el (5 min)
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowVideoVote(true)}
                  className="h-7 bg-red-600 hover:bg-red-700 text-white text-xs"
                >
                  Ouvrir le vote vidÃ©o
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <PollSection
                  salonId={backendSalonId}
                  isAdmin={isAdmin}
                  currentUser={currentUser.name}
                />
              </div>
            </div>
          )}
          {activeTab === "polls" && !canUsePolls && (
            <div className={`flex-1 p-4 ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
              Les sondages sont dÃ©sactivÃ©s pour votre compte.
            </div>
          )}
            </>
          )}
        </div>
        )}
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
              Voter pour une vidÃ©o
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
              Historique des vidÃ©os
            </Button>

            {canManageSpeakingRequests ? (
              <Button
                onClick={() => {
                  setShowSpeakingRequests(true);
                  setShowMenu(false);
                }}
                variant="ghost"
                className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
              >
                <Users className="w-4 h-4 mr-2" />
                Demandes de parole{speakingQueueCount > 0 ? ` (${speakingQueueCount})` : ""}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (isCurrentParticipantActiveSpeaker) return;
                  void (hasRaisedHand ? handleLowerHand() : handleRaiseHand());
                  setShowMenu(false);
                }}
                variant="ghost"
                disabled={isCurrentParticipantActiveSpeaker}
                className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
              >
                <Users className="w-4 h-4 mr-2" />
                {isCurrentParticipantActiveSpeaker
                  ? "Vous avez la parole"
                  : hasRaisedHand ? "Annuler ma demande" : "Lever la main"}
              </Button>
            )}

            {(isAdmin || effectiveRole === "regie") && (
              <Button
                onClick={() => {
                  setAnnouncementDraft(liveAnnouncement);
                  setShowAnnouncementPanel(true);
                  setShowMenu(false);
                }}
                variant="ghost"
                className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
              >
                <Megaphone className="w-4 h-4 mr-2" />
                Annonce regie
              </Button>
            )}

            {(isAdmin || effectiveRole === "regie") && (
              <Button
                onClick={() => {
                  setPostVideoQuestionDraft(postVideoQuestion);
                  setShowPostVideoQuestionPanel(true);
                  setShowMenu(false);
                }}
                variant="ghost"
                className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Question apres video
              </Button>
            )}

            {(isAdmin || effectiveRole === "regie") && (
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
            )}

            {(isAdmin || effectiveRole === "regie") && (
              <Button
                onClick={() => {
                  setShowRegieProgramPanel(true);
                  setShowMenu(false);
                }}
                variant="ghost"
                className={`justify-start ${theme === 'dark' ? 'text-white hover:bg-zinc-700' : 'text-black hover:bg-gray-100'}`}
              >
                <LayoutList className="w-4 h-4 mr-2" />
                Programme regie
              </Button>
            )}

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
                  GÃ©rer les permissions
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
                  GÃ©rer les vidÃ©os
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
                  GÃ©rer les vidÃ©os
                </Button>
              </>
            )}

            {canControlVideo && (
              <>
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

      {/* Feature D â€” Panneau Contenu du Salon (rÃ©sumÃ©s IA de toutes les vidÃ©os) */}
      {showContentPanel && (
        <RoomContentPanel
          playlist={playlist}
          roomName={roomName}
          theme={theme}
          onClose={() => setShowContentPanel(false)}
        />
      )}

      {/* Feature D/G : Panel de preview IA avant lancement vidÃ©o */}
      {previewVideo && (
        <AIVideoPreviewPanel
          video={previewVideo}
          onConfirm={(video) => handlePlayVideo(video)}
          onCancel={() => setPreviewVideo(null)}
          theme={theme}
        />
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
          poll={liveVideoVotePoll}
          remainingSeconds={liveVoteRemainingSeconds}
          canManagePoll={canManageVideoVotePoll}
          canVote={canVoteVideoPoll}
          currentUserVoteKey={voteUserKey}
          onStartPoll={handleStartVideoVotePoll}
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

      {showSpeakingRequests && canManageSpeakingRequests && (
        <SpeakingRequestsPanel
          isOpen={showSpeakingRequests}
          requests={speakingQueue}
          activeSpeaker={activeSpeakerRequest}
          onClose={() => setShowSpeakingRequests(false)}
          onApprove={handleApproveSpeakingRequest}
          onRemove={handleRemoveSpeakingRequest}
          onClearActiveSpeaker={handleClearActiveSpeaker}
          theme={theme}
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

      {showAnnouncementPanel && canControlVideo && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'} border rounded-xl w-full max-w-md overflow-hidden shadow-2xl`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Megaphone className={`${theme === 'dark' ? 'text-red-400' : 'text-red-600'} w-5 h-5`} />
                <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-lg font-semibold`}>
                  Annonce regie
                </h2>
              </div>
              <button
                onClick={() => setShowAnnouncementPanel(false)}
                className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} text-sm`}
              >
                X
              </button>
            </div>

            <div className="p-4 space-y-4">
              <textarea
                value={announcementDraft}
                onChange={(e) => setAnnouncementDraft(e.target.value.slice(0, 140))}
                placeholder="Ex : Pause dans 5 minutes"
                rows={4}
                className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-black placeholder:text-gray-400'} w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-red-500`}
              />

              {liveAnnouncement && (
                <div className={`${theme === 'dark' ? 'bg-zinc-800 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded-lg p-3 text-sm`}>
                  <p className="text-xs uppercase text-red-500">Annonce active</p>
                  <p className="mt-1">{liveAnnouncement}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {liveAnnouncement && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClearAnnouncement}
                    className={`${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-zinc-800' : 'text-gray-700 hover:text-black hover:bg-gray-100'}`}
                  >
                    Retirer
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAnnouncementPanel(false)}
                  className={`${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-zinc-800' : 'text-gray-700 hover:text-black hover:bg-gray-100'}`}
                >
                  Annuler
                </Button>

                <Button
                  type="button"
                  onClick={handlePublishAnnouncement}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Afficher
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPostVideoQuestionPanel && canControlVideo && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'} border rounded-xl w-full max-w-md overflow-hidden shadow-2xl`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <MessageCircle className={`${theme === 'dark' ? 'text-red-400' : 'text-red-600'} w-5 h-5`} />
                <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-lg font-semibold`}>
                  Question apres video
                </h2>
              </div>
              <button
                onClick={() => setShowPostVideoQuestionPanel(false)}
                className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} text-sm`}
              >
                X
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                La question sera affichee automatiquement aux participants quand la video en cours se termine.
              </p>

              {currentVideo && (
                <div className={`${theme === 'dark' ? 'bg-zinc-800 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded-lg p-3 text-sm`}>
                  <p className="text-xs uppercase text-red-500">Video associee</p>
                  <p className="mt-1 truncate">{currentVideo.title}</p>
                </div>
              )}

              <textarea
                value={postVideoQuestionDraft}
                onChange={(e) => setPostVideoQuestionDraft(e.target.value.slice(0, 220))}
                placeholder="Ex : Qu'avez-vous compris de ce passage ?"
                rows={4}
                className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-black placeholder:text-gray-400'} w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-red-500`}
              />

              {postVideoQuestion && (
                <div className={`${theme === 'dark' ? 'bg-zinc-800 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded-lg p-3 text-sm`}>
                  <p className="text-xs uppercase text-red-500">Question preparee</p>
                  <p className="mt-1">{postVideoQuestion}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {postVideoQuestion && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClearPostVideoQuestion}
                    className={`${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-zinc-800' : 'text-gray-700 hover:text-black hover:bg-gray-100'}`}
                  >
                    Retirer
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPostVideoQuestionPanel(false)}
                  className={`${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-zinc-800' : 'text-gray-700 hover:text-black hover:bg-gray-100'}`}
                >
                  Annuler
                </Button>

                <Button
                  type="button"
                  onClick={handleSavePostVideoQuestion}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRegieProgramPanel && canControlVideo && (
        <RegieProgramPanel
          isOpen={showRegieProgramPanel}
          steps={regieProgramSteps}
          playlist={playlist.map((video) => ({ id: video.id, title: video.title }))}
          status={regieProgramStatus}
          currentStepIndex={regieProgramCurrentStepIndex}
          waitingForVideoEnd={regieProgramWaitingForVideoEnd}
          onAddStep={handleAddRegieProgramStep}
          onRemoveStep={handleRemoveRegieProgramStep}
          onMoveStep={handleMoveRegieProgramStep}
          onStart={handleStartRegieProgram}
          onPause={handlePauseRegieProgram}
          onResume={handleResumeRegieProgram}
          onStop={handleStopRegieProgram}
          onClose={() => setShowRegieProgramPanel(false)}
          theme={theme}
        />
      )}

      {showRegieHistory && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'} border rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-lg`}>
                Historique regie
              </h2>
              <button
                onClick={() => setShowRegieHistory(false)}
                className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
              >
                X
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
              {regieActions.length === 0 ? (
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  Aucune action regie enregistree.
                </p>
              ) : (
                regieActions.map((entry) => (
                  <div
                    key={entry.id}
                    className={`${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'} rounded-lg p-3`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-sm font-medium`}>
                        {entry.action}
                      </p>
                      <span className="text-gray-500 text-xs">
                        {entry.time}
                      </span>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm mt-1`}>
                      {entry.details}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Par {entry.user}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ShareRoomDialog temporairement dÃ©sactivÃ© pour debug */}
      {showShareDialog && roomCode && (
        <ShareRoomDialog
          isOpen={showShareDialog}
          roomCode={roomCode}
          roomName={roomName || 'Salon'}
          onClose={() => setShowShareDialog(false)}
          theme={theme}
        />
      )}

      {/* â”€â”€ Feature 68 : Overlay compte Ã  rebours partagÃ© â”€â”€ */}
      {activeCountdown && (
        <SharedCountdownOverlay
          key={activeCountdown.key}
          seconds={activeCountdown.seconds}
          theme={theme}
          onFinished={handleCountdownFinished}
        />
      )}

      {activeVideoTransition && (
        <div className="fixed inset-0 z-[10020] pointer-events-none">
          {activeVideoTransition.type === "fade_black" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#000",
                animation: "videoTransitionFadeBlack 520ms ease-in-out forwards",
              }}
            />
          )}
          {activeVideoTransition.type === "slide_lateral" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.9) 42%, rgba(0,0,0,0.9) 58%, transparent 100%)",
                transform: "translateX(-110%)",
                animation: "videoTransitionSlideLateral 560ms cubic-bezier(.22,1,.36,1) forwards",
              }}
            />
          )}
          {activeVideoTransition.type === "flash_white" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#fff",
                animation: "videoTransitionFlashWhite 260ms ease-out forwards",
              }}
            />
          )}
          <style>{`
            @keyframes videoTransitionFadeBlack {
              0% { opacity: 0; }
              45% { opacity: 1; }
              100% { opacity: 0; }
            }
            @keyframes videoTransitionSlideLateral {
              0% { transform: translateX(-110%); opacity: 1; }
              100% { transform: translateX(110%); opacity: 1; }
            }
            @keyframes videoTransitionFlashWhite {
              0% { opacity: 0; }
              25% { opacity: 0.95; }
              100% { opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* â”€â”€ Feature 70 : Panneau TTS (rÃ©gie uniquement) â”€â”€ */}
      {showTTSPanel && (isAdmin || effectiveRole === "regie") && (
        <TTSAnnouncementPanel
          onAnnounce={handleTTSAnnounce}
          theme={theme}
          onClose={() => setShowTTSPanel(false)}
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

      {showInterludePanel && canControlVideo && (
        <SessionInterludePanel
          isOpen={showInterludePanel}
          value={getInterludeDraftFromState(sessionInterlude)}
          onClose={() => setShowInterludePanel(false)}
          onApply={handleApplyInterlude}
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
