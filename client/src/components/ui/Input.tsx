/**
 * Projet : WithYou
 * Fichier : components/ui/input.tsx
 *
 * Description :
 * Composant input réutilisable pour les formulaires.
 * Supporte différents types (text, email, password, url, etc.),
 * modes clair et sombre, états focus/disabled/invalid.
 *
 * Props :
 * - type : "text" | "email" | "password" | "url" | "number" | etc.
 * - className : classes CSS additionnelles
 * - placeholder : texte de placeholder
 * - value : valeur contrôlée
 * - onChange : fonction appelée au changement
 * - disabled : désactiver l'input
 * - required : champ requis
 * - aria-invalid : marquer l'input comme invalide
 *
 * Variantes de type :
 * - text : Texte normal (par défaut)
 * - email : Email avec validation navigateur
 * - password : Mot de passe masqué
 * - url : URL avec validation navigateur
 * - number : Nombre avec contrôles +/-
 * - file : Sélection de fichier
 *
 * États :
 * - Normal : bordure grise, fond transparent
 * - Focus : ring bleu (3px), bordure rouge
 * - Hover : aucun changement (accessibilité)
 * - Disabled : opacity-50, cursor-not-allowed
 * - Invalid : ring rouge, bordure rouge (aria-invalid)
 *
 * Utilisé dans :
 * - CreateRoomPage.tsx (nom salon, vidéo URL, mot de passe)
 * - JoinRoomPage.tsx (code salon, mot de passe)
 * - SignInPage.tsx (email, mot de passe)
 * - SignUpPage.tsx (nom, email, mot de passe, confirmation)
 * - ForgotPasswordPage.tsx (email)
 * - RoomPage.tsx (message chat)
 * - SettingsPage.tsx (tous les champs de paramètres)
 * - ProfilePage.tsx (nom, bio, etc.)
 */

// ==================== STYLES ====================
//
// COULEURS :
// - Fond (dark) : bg-input/30 (#27272A avec 30% opacité)
// - Fond (light) : bg-white (#FFFFFF)
// - Bordure : border-input (#3F3F46 dark, #D4D4D8 light)
// - Bordure focus : border-ring (red-600)
// - Texte : text-foreground (white dark, black light)
// - Placeholder : text-muted-foreground (#A1A1AA)
// - Sélection : bg-primary (red-600) text-white
// - Ring focus : ring-ring/50 (red-600 avec 50% opacité)
// - Ring invalid : ring-destructive/20 (red-600 avec 20% opacité)
//
// MARGES & ESPACEMENTS :
// - px-3 : 12px padding horizontal
// - py-1 : 4px padding vertical
// - h-9 : 36px hauteur par défaut
//
// POLICES & TAILLES :
// - text-base : 16px sur desktop
// - text-sm : 14px sur mobile (md:text-sm)
// - placeholder : même taille que le texte
//
// BORDURES & ARRONDIS :
// - rounded-md : 6px arrondi
// - border : 1px bordure
//
// ÉTATS :
// - Focus : border-ring + ring-ring/50 (3px ring)
// - Invalid : border-destructive + ring-destructive/20
// - Disabled : opacity-50 + pointer-events-none
//
// ANIMATIONS :
// - transition-[color,box-shadow] : transition sur couleur et ring

import * as React from "react";

import { cn } from "./utils";

// ==================== COMPOSANT ====================

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Styles de base
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        
        // État focus (ring bleu 3px)
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        
        // État invalid (ring rouge)
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        
        // Classes additionnelles
        className,
      )}
      {...props}
    />
  );
}

export { Input };
