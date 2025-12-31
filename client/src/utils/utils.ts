/**
 * Projet : WithYou
 * Fichier : utils/utils.ts
 *
 * Description :
 * Fichier utilitaire regroupant des fonctions helpers partagées
 * utilisées dans l’ensemble du front-end de l’application.
 *
 * Ce fichier centralise des fonctions génériques afin de :
 *  - éviter la duplication de logique dans les composants
 *  - améliorer la lisibilité et la maintenabilité du code
 *  - garantir une cohérence globale du comportement de l’application
 *
 * Fonctions principales :
 *  - cn : fusion intelligente de classes CSS (Tailwind + clsx)
 *  - formatDate : formatage des dates en français
 *  - generateId : génération d’identifiants uniques côté front
 *  - isValidEmail : validation simple du format d’un email
 *  - truncate : réduction d’un texte avec ajout de points de suspension
 *
 * Ce fichier est utilisé par :
 *  - les composants UI (Button, Input, Card, etc.)
 *  - les pages (RoomPage, PublicRoomsPage, ProfilePage, etc.)
 *  - les layouts et composants globaux
 */


import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to French locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
