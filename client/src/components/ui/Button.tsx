/**
 * Projet : WithYou
 * Fichier : components/ui/button.tsx
 *
 * Description :
 * Composant bouton générique et réutilisable utilisé dans toute l’application.
 *
 * Ce composant permet :
 *  - d’afficher des boutons cohérents avec le design global
 *  - de gérer plusieurs variantes (principal, secondaire, destructif, etc.)
 *  - de proposer différentes tailles selon le contexte
 *  - d’intégrer facilement des icônes et du texte
 *  - de gérer les états d’interaction (hover, focus, disabled)
 *
 * Il s’appuie sur class-variance-authority (CVA)
 * pour centraliser la gestion des styles
 * et garantir une cohérence visuelle sur tout le front-end.
 *
 * Le bouton supporte également la composition via Slot,
 * ce qui permet de l’utiliser comme wrapper autour d’autres composants
 * (liens, icônes, éléments interactifs).
 *
 * Utilisé dans la majorité des pages et composants de WithYou
 * (navigation, formulaires, actions utilisateur, salons, paramètres).
 */

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