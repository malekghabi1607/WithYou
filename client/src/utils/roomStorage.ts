/**
 * Projet : WithYou
 * Fichier : utils/roomStorage.ts
 *
 * Description :
 * Utilitaire de gestion du stockage local des données des salons.
 * Permet la persistance des messages et playlists via localStorage.
 * Gère :
 *  - La sauvegarde automatique des données de salon
 *  - Le chargement des données sauvegardées
 *  - La structure des données (messages, playlist)
 *  - La gestion des erreurs de stockage
 *
 * Utilisé dans pages/RoomPage.tsx pour la persistance des données.
 */

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

interface RoomData {
  messages: Message[];
  playlist: VideoInPlaylist[];
  lastUpdated: number;
}

const STORAGE_KEY_PREFIX = 'withyou_room_';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

export function saveRoomData(roomId: string, messages: Message[], playlist: VideoInPlaylist[]) {
  try {
    const data: RoomData = {
      messages,
      playlist,
      lastUpdated: Date.now()
    };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${roomId}`, JSON.stringify(data));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données du salon:', error);
  }
}

export function loadRoomData(roomId: string): RoomData | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${roomId}`);
    if (!stored) return null;

    const data: RoomData = JSON.parse(stored);
    
    // Vérifier si les données ne sont pas trop anciennes
    if (Date.now() - data.lastUpdated > CACHE_DURATION) {
      clearRoomData(roomId);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des données du salon:', error);
    return null;
  }
}

export function clearRoomData(roomId: string) {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${roomId}`);
  } catch (error) {
    console.error('Erreur lors de la suppression des données du salon:', error);
  }
}

export function clearAllRoomData() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de toutes les données des salons:', error);
  }
}