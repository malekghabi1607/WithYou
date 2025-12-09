/**
 * Gestion du stockage des votes et notations
 * Limite : 1 vote/notation par jour
 */

interface VoteRecord {
  videoId?: string;
  roomId?: string;
  adminId?: string;
  timestamp: number;
  type: "video" | "room" | "admin";
}

const STORAGE_KEY = "withyou_votes";

/**
 * Récupère tous les votes stockés
 */
function getVotes(): VoteRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Sauvegarde un vote
 */
function saveVote(vote: VoteRecord): void {
  try {
    const votes = getVotes();
    votes.push(vote);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du vote:", error);
  }
}

/**
 * Vérifie si un vote est encore valide (moins de 24h)
 */
function isVoteValid(timestamp: number): boolean {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return (now - timestamp) < twentyFourHours;
}

/**
 * Nettoie les votes expirés (plus de 24h)
 */
function cleanExpiredVotes(): void {
  try {
    const votes = getVotes();
    const validVotes = votes.filter(vote => isVoteValid(vote.timestamp));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validVotes));
  } catch (error) {
    console.error("Erreur lors du nettoyage des votes:", error);
  }
}

/**
 * Vérifie si l'utilisateur a déjà voté pour une vidéo aujourd'hui
 */
export function hasVotedForVideo(videoId: string): boolean {
  cleanExpiredVotes();
  const votes = getVotes();
  return votes.some(
    vote => vote.type === "video" && vote.videoId === videoId && isVoteValid(vote.timestamp)
  );
}

/**
 * Enregistre un vote pour une vidéo
 */
export function recordVideoVote(videoId: string): boolean {
  if (hasVotedForVideo(videoId)) {
    return false;
  }
  saveVote({
    videoId,
    timestamp: Date.now(),
    type: "video"
  });
  return true;
}

/**
 * Vérifie si l'utilisateur a déjà noté un salon aujourd'hui
 */
export function hasRatedRoom(roomId: string): boolean {
  cleanExpiredVotes();
  const votes = getVotes();
  return votes.some(
    vote => vote.type === "room" && vote.roomId === roomId && isVoteValid(vote.timestamp)
  );
}

/**
 * Enregistre une notation de salon
 */
export function recordRoomRating(roomId: string): boolean {
  if (hasRatedRoom(roomId)) {
    return false;
  }
  saveVote({
    roomId,
    timestamp: Date.now(),
    type: "room"
  });
  return true;
}

/**
 * Vérifie si l'utilisateur a déjà noté un admin aujourd'hui
 */
export function hasRatedAdmin(adminId: string): boolean {
  cleanExpiredVotes();
  const votes = getVotes();
  return votes.some(
    vote => vote.type === "admin" && vote.adminId === adminId && isVoteValid(vote.timestamp)
  );
}

/**
 * Enregistre une notation d'admin
 */
export function recordAdminRating(adminId: string): boolean {
  if (hasRatedAdmin(adminId)) {
    return false;
  }
  saveVote({
    adminId,
    timestamp: Date.now(),
    type: "admin"
  });
  return true;
}

/**
 * Obtient le temps restant avant de pouvoir revoter (en heures)
 */
export function getTimeUntilNextVote(voteType: "video" | "room" | "admin", id: string): number {
  cleanExpiredVotes();
  const votes = getVotes();
  
  let relevantVote: VoteRecord | undefined;
  
  if (voteType === "video") {
    relevantVote = votes.find(vote => vote.type === "video" && vote.videoId === id);
  } else if (voteType === "room") {
    relevantVote = votes.find(vote => vote.type === "room" && vote.roomId === id);
  } else if (voteType === "admin") {
    relevantVote = votes.find(vote => vote.type === "admin" && vote.adminId === id);
  }
  
  if (!relevantVote) return 0;
  
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  const elapsed = now - relevantVote.timestamp;
  const remaining = twentyFourHours - elapsed;
  
  return Math.max(0, Math.ceil(remaining / (60 * 60 * 1000))); // En heures
}

/**
 * Formate le temps restant en texte lisible
 */
export function formatTimeUntilNextVote(hours: number): string {
  if (hours === 0) return "Vous pouvez voter maintenant";
  if (hours === 1) return "Vous pourrez voter dans 1 heure";
  if (hours < 24) return `Vous pourrez voter dans ${hours} heures`;
  return "Vous pourrez voter demain";
}
