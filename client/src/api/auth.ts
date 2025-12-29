// src/api/auth.ts
import { API_URL } from "./index";

type Json = Record<string, any>;

export type AuthToken = {
  token: string;
  raw: Json; // on garde la réponse brute au cas où tu veux user/id/etc.
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
};

function extractToken(data: Json): string | null {
  return data?.access_token || data?.token || data?.jwt || null;
}

function extractErrorMessage(data: any): string {
  // Laravel renvoie souvent {message: "..."} ou {errors: {...}}
  if (!data) return "Erreur inconnue";

  if (typeof data === "string") return data;
  if (typeof data?.message === "string") return data.message;

  // Validation errors: { errors: { field: ["msg"] } }
  const errors = data?.errors;
  if (errors && typeof errors === "object") {
    const firstKey = Object.keys(errors)[0];
    const firstVal = errors[firstKey];
    if (Array.isArray(firstVal) && firstVal[0]) return String(firstVal[0]);
    if (typeof firstVal === "string") return firstVal;
  }

  try {
    return JSON.stringify(data);
  } catch {
    return "Erreur inconnue";
  }
}

async function request<T = any>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    // Erreur réseau (backend off, CORS, etc.)
    throw new Error("Erreur réseau (backend inaccessible)");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(extractErrorMessage(data) || `Erreur HTTP ${res.status}`);
  }

  return data as T;
}

/** POST /api/auth/login */
export async function login(email: string, password: string): Promise<AuthToken> {
  const data = await request<Json>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const token = extractToken(data);
  if (!token) throw new Error("Token manquant dans la réponse du backend.");

  return { token, raw: data };
}

/** POST /api/auth/register */
export async function register(payload: RegisterPayload): Promise<AuthToken> {
  const data = await request<Json>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // selon backend : il peut renvoyer token direct OU juste user
  const token = extractToken(data);
  if (!token) {
    // Si register ne renvoie pas de token, on laisse raw et on met token vide
    // (tu pourras enchaîner avec login côté page si besoin)
    return { token: "", raw: data };
  }

  return { token, raw: data };
}

/** POST /api/auth/forgot-password */
export async function forgotPassword(email: string) {
  let res: Response;

  try {
    res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new Error("Erreur réseau (backend inaccessible)");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data as any).message) ||
      `Erreur HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data; // ex: { message: "Email envoyé" }
}
/** GET /api/auth/me */
export async function me(token?: string): Promise<Json> {
  // token optionnel: si pas fourni, on tente localStorage
  const t = token || localStorage.getItem("token") || localStorage.getItem("jwt_token") || "";
  if (!t) throw new Error("Aucun token trouvé (connecte-toi d'abord).");

  return request<Json>("/auth/me", { method: "GET" }, t);
}

/** Supprime le token côté front (pas besoin du backend) */
export function logoutLocal() {
  localStorage.removeItem("token");
  localStorage.removeItem("jwt_token");
}
