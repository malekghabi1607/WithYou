// LocalStorage utilities for WithYou

export interface Room {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  creator: string;
  creatorEmail: string;
  password?: string;
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

export function deleteRoom(roomId: string): void {
  const rooms = getRooms().filter(r => r.id !== roomId);
  localStorage.setItem('withyou_rooms', JSON.stringify(rooms));
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