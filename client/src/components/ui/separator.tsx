/**
 * Projet : WithYou – Plateforme de visionnage collaboratif
 * Fichier : Separator.tsx
 *
 * Description :
 * Composant séparateur visuel basé sur Radix UI.
 *
 * Rôle :
 *  - Séparer visuellement des sections de l’interface
 *  - Supporter les orientations horizontale et verticale
 *  - Garantir accessibilité et cohérence visuelle
 *
 * Technologies :
 *  - @radix-ui/react-separator
 *  - Tailwind CSS
 */

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "./utils";


function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
