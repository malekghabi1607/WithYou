/**
 * Composant Skeleton
 *
 * Utilisé pour afficher un placeholder de chargement
 * pendant le chargement des données.
 *
 * Fonctionnalités :
 *  - Animation de pulsation (animate-pulse)
 *  - Forme personnalisable via className
 *  - Adaptable à tous types de contenus (texte, carte, image, bouton)
 *
 * Basé sur :
 *  - Tailwind CSS pour le style et l’animation
 *
 * Utilisable côté client avec Next.js.
 */

import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
