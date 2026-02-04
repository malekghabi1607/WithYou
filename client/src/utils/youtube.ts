/**
 * Projet : WithYou
 * Fichier : utils/youtube.ts
 *
 * Description :
 * Utilitaires pour l'extraction et la validation des URLs YouTube.
 * Permet de convertir différents formats d'URLs YouTube en ID de vidéo.
 * Gère :
 *  - L'extraction d'ID depuis les URLs standards (youtube.com/watch?v=...)
 *  - L'extraction d'ID depuis les URLs courtes (youtu.be/...)
 *  - L'extraction d'ID depuis les URLs embed (youtube.com/embed/...)
 *  - La validation des IDs YouTube
 *
 * Utilisé dans components/room/VideoManagementPanel.tsx pour l'ajout de vidéos.
 */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // Nettoyer l'URL
  url = url.trim();

  // Si c'est juste un ID (11 caractères alphanumériques), le retourner directement
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Pattern pour youtube.com/watch?v=
  const watchPattern = /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/;
  const watchMatch = url.match(watchPattern);
  if (watchMatch) {
    return watchMatch[1];
  }

  // Pattern pour youtu.be/
  const shortPattern = /youtu\.be\/([a-zA-Z0-9_-]{11})/;
  const shortMatch = url.match(shortPattern);
  if (shortMatch) {
    return shortMatch[1];
  }

  // Pattern pour youtube.com/embed/
  const embedPattern = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/;
  const embedMatch = url.match(embedPattern);
  if (embedMatch) {
    return embedMatch[1];
  }

  return null;
}

/**
 * Vérifie si une URL est une URL YouTube valide
 */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

/**
 * Génère l'URL de la miniature YouTube
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}