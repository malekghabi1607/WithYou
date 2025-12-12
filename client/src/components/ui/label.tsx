/**
 * Projet : WithYou
 * Fichier : components/ui/label.tsx
 *
 * Description :
 * Composant Label réutilisable basé sur Radix UI.
 * Il permet d’associer un libellé accessible à un champ de formulaire,
 * tout en assurant la cohérence visuelle et la gestion des états (disabled).
 *
 * Objectif :
 * - Améliorer l’accessibilité des formulaires
 * - Centraliser le style des labels dans le design system
 */
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "./utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
