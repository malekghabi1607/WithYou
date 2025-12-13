/**
 * Projet : WithYou
 * Fichier : pages/RoomPage.tsx
 *
 * Description :
 * Page principale du salon de visionnage collaboratif.
 * Interface complète pour regarder des vidéos ensemble en temps réel.
 * Gère :
 *  - Le lecteur vidéo YouTube avec synchronisation
 *  - Le chat en direct avec réactions et émojis
 *  - La liste des participants avec statuts en ligne/hors-ligne
 *  - La playlist vidéo avec votes et favoris
 *  - Les contrôles admin (ajouter/supprimer vidéos, gérer permissions)
 *  - Les panneaux d'informations et de notation
 *  - La persistance des données (messages, playlist) via localStorage
 *  - Les modes clair et sombre
 *
 * Utilisé dans routes/AppRouter.tsx via RoomPageWrapper.
 */



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