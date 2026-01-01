/**
 * Projet : WithYou
 * Fichier : api/rooms.ts
 *
 * Description :
 * Module contenant toutes les requêtes API relatives aux salles :
 *  - Création de salle
 *  - Récupération des informations d’une salle
 *  - Gestion de la playlist
 *  - Gestion des sondages
 *  - Gestion des membres
 *  - Entrée / sortie d’une salle
 */

// client/src/api/rooms.ts

const API_URL = import.meta.env.VITE_API_URL;

// 🔹 Extraire youtubeId depuis une URL YouTube
export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// 🔹 Créer un salon avec vidéo initiale (back Laravel)
export async function createSalon(payload: {
  name: string;
  description?: string;
  youtubeId?: string;
  title?: string;
}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/salons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("createSalon error", res.status, res.statusText);
    throw new Error("Erreur création salon");
  }

  const data = await res.json();
  return data.salon as {
    id_salon: string;
    room_code: string;
    name: string;
    owner_id: string;
    created_at: string;
  };
}

// 🔹 Récupérer la playlist
export async function fetchPlaylist(roomId: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/salons/${roomId}/playlist`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    console.error("fetchPlaylist error", res.status, res.statusText);
    throw new Error("Erreur fetch playlist");
  }

  return res.json();
}

// 🔹 Ajouter une vidéo
export async function addVideoToPlaylist(
  roomId: string,
  data: { title: string; youtubeId: string }
) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/salons/${roomId}/playlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    console.error("addVideoToPlaylist error", res.status, res.statusText);
    throw new Error("Erreur ajout vidéo");
  }

  return res.json();
}

// 🔹 Supprimer une vidéo
export async function removeVideoFromPlaylist(roomId: string, videoId: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/salons/${roomId}/playlist/${videoId}`, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    console.error("removeVideoFromPlaylist error", res.status, res.statusText);
    throw new Error("Erreur suppression vidéo");
  }
}
