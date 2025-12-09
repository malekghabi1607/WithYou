/**
 * Projet : WithYou
 * Fichier : components/ui/badge.tsx
 *
 * Description :
 * Composant badge (pastille) pour afficher des statuts, compteurs, ou labels.
 * Compact, avec variants de couleur et icônes optionnels.
 *
 * Props :
 * - variant : "default" | "secondary" | "destructive" | "outline"
 * - className : classes CSS additionnelles
 * - asChild : utiliser Slot pour composer
 * - children : contenu du badge (texte, icônes)
 *
 * Variants :
 * - default : Rouge (bg-red-600, text-white) - statut principal
 * - secondary : Gris (bg-gray-200, text-black) - statut secondaire
 * - destructive : Rouge foncé (bg-red-700) - danger/alerte
 * - outline : Bordure uniquement (transparent) - discret
 *
 * Taille :
 * - Fixe : h-auto (hauteur adaptée au contenu)
 * - Padding : px-2 py-0.5 (8px horizontal, 2px vertical)
 * - Texte : text-xs (12px)
 * - Icônes : size-3 (12px x 12px)
 *
 * États :
 * - Normal : couleur par défaut selon variant
 * - Hover (si lien) : opacity 90%
 * - Focus : ring de focus (accessibilité)
 *
 * Utilisé dans :
 * - RoomPage.tsx (badge "En direct", rôle Admin/Invité)
 * - PublicRoomsPage.tsx (compteur participants, type de salon)
 * - Header.tsx (notifications, statut utilisateur)
 * - CreateRoomPage.tsx (statut Public/Privé)
 * - ProfilePage.tsx (niveau utilisateur, badges achievements)
 * - VideoVotePanel.tsx (nombre de votes)
 */

// ==================== STYLES ====================
//
// COULEURS :
// - default : bg-primary (red-600) text-white
// - secondary : bg-secondary (gray-200) text-black
// - destructive : bg-destructive (red-700) text-white
// - outline : border text-foreground bg-transparent
//
// MARGES & ESPACEMENTS :
// - px-2 : 8px padding horizontal
// - py-0.5 : 2px padding vertical
// - gap-1 : 4px entre icône et texte
//
// POLICES & TAILLES :
// - text-xs : 12px taille de texte
// - font-medium : 500 poids de police
// - [&>svg]:size-3 : icônes 12x12px
//
// BORDURES & ARRONDIS :
// - rounded-md : 6px arrondi
// - border : 1px bordure (outline uniquement)
//
// ÉTATS :
// - Hover (lien) : bg-primary/90 (opacity 90%)
// - Focus : ring-ring/50 (3px ring)
//
// COMPORTEMENTS :
// - whitespace-nowrap : pas de retour à la ligne
// - shrink-0 : ne se réduit pas dans flex
// - w-fit : largeur adaptée au contenu
// - overflow-hidden : masque le débordement

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// Définition des variants du badge
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        // Badge principal rouge
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        
        // Badge secondaire gris
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        
        // Badge destructif/danger
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        
        // Badge avec bordure uniquement
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// ==================== COMPOSANT ====================

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  // Si asChild est true, utiliser Slot pour composer
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };