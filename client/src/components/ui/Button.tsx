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

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

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
