/**
 * Projet : WithYou
 * Fichier : components/ui/button.tsx
 *
 * Description :
 * Composant bouton réutilisable avec variants et tailles personnalisables.
 * Supporte les modes clair et sombre, états hover/disabled, et icônes.
 *
 * Props :
 * - variant : "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
 * - size : "default" | "sm" | "lg" | "icon"
 * - className : classes CSS additionnelles
 * - asChild : utiliser Slot pour composer avec d'autres composants
 * - disabled : désactiver le bouton
 * - children : contenu du bouton (texte, icônes, etc.)
 *
 * Variants :
 * - default : Bouton principal rouge (bg-red-600, hover:bg-red-700)
 * - destructive : Bouton d'action destructive rouge (suppression, danger)
 * - outline : Bouton avec bordure, fond transparent
 * - secondary : Bouton secondaire gris
 * - ghost : Bouton transparent, hover subtil
 * - link : Bouton style lien avec soulignement
 *
 * Tailles :
 * - default : h-9 px-4 (36px hauteur, 16px padding horizontal)
 * - sm : h-8 px-3 (32px hauteur, 12px padding horizontal)
 * - lg : h-10 px-6 (40px hauteur, 24px padding horizontal)
 * - icon : size-9 (36px x 36px, carré pour icônes)
 *
 * États :
 * - Normal : couleur par défaut selon variant
 * - Hover : couleur plus foncée (opacity 90%)
 * - Active : scale-95 (feedback visuel au clic)
 * - Disabled : opacity-50 + pointer-events-none
 * - Focus : ring de focus visible (accessibilité)
 *
 * Utilisé dans :
 * - CreateRoomPage.tsx (bouton "Créer le salon")
 * - SignInPage.tsx (bouton "Se connecter")
 * - SignUpPage.tsx (bouton "S'inscrire")
 * - Header.tsx (boutons navigation, déconnexion)
 * - RoomPage.tsx (boutons Play/Pause, Quitter, Ajouter)
 * - PublicRoomsPage.tsx (boutons "Rejoindre")
 * - SettingsPage.tsx (boutons "Enregistrer", "Annuler")
 * - Et TOUS les autres composants/pages
 */

// ==================== STYLES ====================
//
// COULEURS :
// - default : bg-primary (red-600) text-white hover:bg-primary/90
// - destructive : bg-red-600 text-white hover:bg-red-700
// - outline : border bg-transparent hover:bg-accent
// - secondary : bg-gray-200 text-black hover:bg-gray-300
// - ghost : transparent hover:bg-accent
// - link : text-red-600 underline
//
// MARGES & ESPACEMENTS :
// - gap : gap-2 (8px) entre icône et texte
// - px-4 : 16px padding horizontal (default)
// - px-3 : 12px padding horizontal (sm)
// - px-6 : 24px padding horizontal (lg)
//
// TAILLES :
// - default : h-9 (36px hauteur)
// - sm : h-8 (32px hauteur)
// - lg : h-10 (40px hauteur)
// - icon : size-9 (36px x 36px)
//
// BORDURES & ARRONDIS :
// - rounded-md : 6px arrondi par défaut
//
// ANIMATIONS :
// - transition-all : transition sur toutes les propriétés (200ms)
// - hover:scale-105 : légère augmentation au survol (optionnel selon usage)
// - active:scale-95 : légère réduction au clic

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// Définition des variants du bouton avec class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Bouton principal (rouge, texte blanc)
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        
        // Bouton destructif (actions de suppression/danger)
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        
        // Bouton avec bordure (fond transparent)
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        
        // Bouton secondaire (gris)
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        
        // Bouton fantôme (transparent, hover subtil)
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        
        // Bouton lien (texte souligné)
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Taille par défaut (36px hauteur)
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        
        // Petite taille (32px hauteur)
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        
        // Grande taille (40px hauteur)
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        
        // Taille icône (36x36px carré)
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// ==================== COMPOSANT ====================

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  // Si asChild est true, utiliser Slot pour composer avec d'autres composants
  // Sinon, utiliser un élément button normal
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };