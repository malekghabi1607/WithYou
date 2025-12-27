/**
 * Projet : WithYou
 * Fichier : components/ui/utils.ts
 *
 * Description :
 * Fonction utilitaire pour gérer et fusionner
 * les classes CSS (Tailwind) dans les composants.
 */


import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
