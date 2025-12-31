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
// src/api/rooms.ts
import { API_URL } from "./index";

export type Room = {
  id: string;
  name: string;
  description?: string;
  creator?: string;
  participants?: number;
  maxParticipants?: number;
  isPublic?: boolean;
  currentVideo?: string;
  thumbnail?: string;
  createdAt?: string;
  tags?: string[];
  rating?: number;
  // on garde de la flexibilité si le backend renvoie d’autres champs
  [key: string]: any;
};

function getToken() {
  return localStorage.getItem("token") || "";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Erreur réseau (backend inaccessible)");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
  let msg = `Erreur HTTP ${res.status}`;

  if (data && typeof data === "object") {
    const anyData = data as any;

    // cas: { message: "..." }
    if (typeof anyData.message === "string") {
      msg = anyData.message;
    }

    // cas Laravel: { errors: { field: ["msg"] } }
    else if (anyData.errors && typeof anyData.errors === "object") {
      const firstKey = Object.keys(anyData.errors)[0];
      const firstVal = anyData.errors[firstKey];

      if (Array.isArray(firstVal) && firstVal.length > 0) {
        msg = firstVal[0];
      }
    }
  }

  throw new Error(msg);
}


  return data as T;
}

// GET /api/salons/:id
export async function getRoom(roomId: string): Promise<Room> {
  return request<Room>(`/salons/${roomId}`, { method: "GET" });
}

// POST /api/salons/:id/connect
export async function connectRoom(roomId: string): Promise<any> {
  return request(`/salons/${roomId}/connect`, { method: "POST" });
}

// POST /api/salons/:id/disconnect (pour plus tard)
export async function disconnectRoom(roomId: string): Promise<any> {
  return request(`/salons/${roomId}/disconnect`, { method: "POST" });
}
