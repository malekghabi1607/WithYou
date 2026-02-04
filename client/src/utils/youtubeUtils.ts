/**
 * Extrait l'ID YouTube depuis différents formats d'URL
 * Exemples supportés:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // Pattern 1: youtube.com/watch?v=ID
  const watchPattern = /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
  const watchMatch = url.match(watchPattern);
  if (watchMatch) return watchMatch[1];

  // Pattern 2: youtu.be/ID
  const shortPattern = /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const shortMatch = url.match(shortPattern);
  if (shortMatch) return shortMatch[1];

  // Pattern 3: youtube.com/embed/ID
  const embedPattern = /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const embedMatch = url.match(embedPattern);
  if (embedMatch) return embedMatch[1];

  // Si c'est déjà un ID (11 caractères)
  if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Génère l'URL de la miniature YouTube
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

