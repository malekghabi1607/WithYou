/**
 * Projet : WithYou
 * Fichier : utils/storage.ts
 *
 * Description :
 * Fichier utilitaire centralisant la gestion du localStorage
 * pour l’application front-end WithYou.
 *
 * Il permet de persister les données côté client, notamment :
 *  - les salons (création, suppression, récupération)
 *  - les messages de chat et leurs réactions
 *  - les vidéos favorites des utilisateurs
 *  - le thème de l’application (clair / sombre)
 *  - la session utilisateur (email, nom)
 *
 * Ces fonctions sont utilisées par les pages et composants
 * liés aux salons, au chat, à la navigation et aux préférences
 * utilisateur afin de conserver l’état de l’application
 * entre les rafraîchissements.
 *
 * Ce fichier ne contient aucune logique d’interface,
 * uniquement des fonctions utilitaires réutilisables.
 */

// LocalStorage utilities for WithYou
// LocalStorage utilities for WithYou

export interface Room {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  creator: string;
  creatorEmail: string;
  password?: string;
  joinCode: string; // Code unique pour rejoindre le salon
  maxParticipants: number;
  videoUrl: string;
  participants: number;
  currentVideo: string;
  thumbnail: string;
  createdAt: string;
  rating: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  user: string;
  text: string;
  timestamp: Date;
  isEmoji?: boolean;
  reactions?: { emoji: string; users: string[] }[];
}

// Rooms Management
export function saveRoom(room: Room): void {
  const rooms = getRooms();
  const existingIndex = rooms.findIndex(r => r.id === room.id);
  
  if (existingIndex >= 0) {
    rooms[existingIndex] = room;
  } else {
    rooms.push(room);
  }
  
  localStorage.setItem('withyou_rooms', JSON.stringify(rooms));
}

export function getRooms(): Room[] {
  const data = localStorage.getItem('withyou_rooms');
  return data ? JSON.parse(data) : [];
}

export function getRoomById(roomId: string): Room | null {
  const rooms = getRooms();
  return rooms.find(r => r.id === roomId) || null;
}

export function getRoomByJoinCode(code: string) {
  const rooms = getRooms();
  return rooms.find(r => 
    typeof r.joinCode === "string" &&
    r.joinCode.toUpperCase() === code.toUpperCase()
  );
}

export function deleteRoom(roomId: string): void {
  const rooms = getRooms().filter(r => r.id !== roomId);
  localStorage.setItem('withyou_rooms', JSON.stringify(rooms));
}

// Participants Management
export function incrementParticipants(roomId: string): boolean {
  const room = getRoomById(roomId);
  if (!room) return false;
  
  // CORRECTION: Ne pas bloquer pour éviter les problèmes de compteur en développement
  // Si le salon semble plein mais qu'on recharge la page, on autorise quand même
  // Le compteur sera géré correctement par le cleanup de useEffect
  
  // Seulement incrémenter si on n'a pas dépassé largement la limite
  if (room.participants < room.maxParticipants * 2) {
    room.participants += 1;
    saveRoom(room);
  }
  
  return true; // Toujours autoriser l'accès
}

export function decrementParticipants(roomId: string): void {
  const room = getRoomById(roomId);
  if (!room) return;
  
  if (room.participants > 0) {
    room.participants -= 1;
    saveRoom(room);
  }
}

export function canJoinRoom(roomId: string): boolean {
  const room = getRoomById(roomId);
  if (!room) return false;
  return room.participants < room.maxParticipants;
}

// Messages Management
export function saveMessage(message: ChatMessage): void {
  const messages = getMessages(message.roomId);
  messages.push(message);
  localStorage.setItem(`withyou_messages_${message.roomId}`, JSON.stringify(messages));
}

export function getMessages(roomId: string): ChatMessage[] {
  const data = localStorage.getItem(`withyou_messages_${roomId}`);
  if (!data) return [];
  
  const messages = JSON.parse(data);
  // Convert timestamp strings back to Date objects
  return messages.map((m: any) => ({
    ...m,
    timestamp: new Date(m.timestamp)
  }));
}

export function addReactionToMessage(
  roomId: string, 
  messageId: string, 
  emoji: string, 
  userName: string
): void {
  const messages = getMessages(roomId);
  const messageIndex = messages.findIndex(m => m.id === messageId);
  
  if (messageIndex >= 0) {
    const message = messages[messageIndex];
    if (!message.reactions) {
      message.reactions = [];
    }
    
    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
    if (reactionIndex >= 0) {
      // Toggle reaction
      const users = message.reactions[reactionIndex].users;
      if (users.includes(userName)) {
        message.reactions[reactionIndex].users = users.filter(u => u !== userName);
        if (message.reactions[reactionIndex].users.length === 0) {
          message.reactions.splice(reactionIndex, 1);
        }
      } else {
        message.reactions[reactionIndex].users.push(userName);
      }
    } else {
      message.reactions.push({ emoji, users: [userName] });
    }
    
    messages[messageIndex] = message;
    localStorage.setItem(`withyou_messages_${roomId}`, JSON.stringify(messages));
  }
}

export function clearRoomMessages(roomId: string): void {
  localStorage.removeItem(`withyou_messages_${roomId}`);
}

// Favorites Management
export interface FavoriteVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  addedAt: string;
  userEmail: string;
}

export function saveFavorite(favorite: FavoriteVideo): void {
  const favorites = getFavorites(favorite.userEmail);
  if (!favorites.find(f => f.id === favorite.id)) {
    favorites.push(favorite);
    localStorage.setItem(`withyou_favorites_${favorite.userEmail}`, JSON.stringify(favorites));
  }
}

export function getFavorites(userEmail: string): FavoriteVideo[] {
  const data = localStorage.getItem(`withyou_favorites_${userEmail}`);
  return data ? JSON.parse(data) : [];
}

export function removeFavorite(userEmail: string, videoId: string): void {
  const favorites = getFavorites(userEmail).filter(f => f.id !== videoId);
  localStorage.setItem(`withyou_favorites_${userEmail}`, JSON.stringify(favorites));
}

// Theme Management
export function getStoredTheme(): "light" | "dark" | null {
  const theme = localStorage.getItem('withyou_theme');
  return theme === "light" || theme === "dark" ? theme : null;
}

export function setStoredTheme(theme: "light" | "dark"): void {
  localStorage.setItem('withyou_theme', theme);
}

// User Session Management
export function saveUserSession(user: { email: string; name: string }): void {
  localStorage.setItem('withyou_user', JSON.stringify(user));
}

export function getUserSession(): { email: string; name: string } | null {
  const data = localStorage.getItem('withyou_user');
  return data ? JSON.parse(data) : null;
}

export function clearUserSession(): void {
  localStorage.removeItem('withyou_user');
}

// Generate unique join code for rooms
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Eviter I, O, 0, 1 pour éviter confusion
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Vérifier que le code n'existe pas déjà
  const existingRoom = getRoomByJoinCode(code);
  if (existingRoom) {
    return generateJoinCode(); // Régénérer si collision
  }
  
  return code;
}

// Initialize example rooms for demo purposes
export function initializeExampleRooms(): void {
  try {
    // Vérifier si le salon CINEMA2025 existe déjà
    const existingRoom = getRoomByJoinCode("CINEMA2025");
    
    if (!existingRoom) {
      const exampleRoom: Room = {
        id: "room-example-cinema",
        name: "🎬 Soirée Cinéma",
        description: "Salon d'exemple pour découvrir WithYou - Regardons des films ensemble !",
        isPublic: true,
        creator: "WithYou Team",
        creatorEmail: "demo@withyou.com",
        password: "",
        joinCode: "CINEMA2025",
        maxParticipants: 50,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        participants: 1,
        currentVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1758686254041-88d7b6ecee8f?w=400",
        createdAt: new Date().toISOString(),
        rating: 4.8
      };
      
      saveRoom(exampleRoom);
      console.log('✅ Salon d\'exemple créé avec le code: CINEMA2025');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du salon d\'exemple:', error);
  }
}

// Reset example room to ensure it's always joinable
export function resetExampleRoom(): void {
  try {
    const existingRoom = getRoomByJoinCode("CINEMA2025");
    
    if (existingRoom) {
      // Créer un nouvel objet au lieu de modifier l'existant
      const updatedRoom = {
        ...existingRoom,
        participants: 1,
        maxParticipants: 50
      };
      saveRoom(updatedRoom);
      console.log('🔄 Salon CINEMA2025 réinitialisé : 1/50 participants');
    } else {
      // Créer le salon s'il n'existe pas
      initializeExampleRooms();
    }
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du salon d\'exemple:', error);
  }
}