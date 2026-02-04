/**
 * Projet : WithYou
 * Fichier : api/index.ts
 *
 * Description :
 * Point d'entrée principal pour les modules API.
 * Regroupe et exporte toutes les fonctions d'API afin de
 * centraliser les imports dans l’application.
 */
// src/api/index.ts
const rawApiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const normalizedBase = rawApiUrl.replace(/\/+$/, "");
export const API_BASE_URL = normalizedBase.endsWith("/api")
  ? normalizedBase.slice(0, -4)
  : normalizedBase;
export const API_URL = `${API_BASE_URL}/api`;
