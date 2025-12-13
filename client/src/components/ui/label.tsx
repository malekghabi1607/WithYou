/**
 * Projet : WithYou
 * Fichier : components/ui/label.tsx
 *
 * Description :
 * Composant Label réutilisable utilisé pour les champs de formulaire.
 *
 * Ce composant permet :
 *  - d’associer un libellé clair et accessible à un champ (input, textarea, etc.)
 *  - d’améliorer l’accessibilité des formulaires
 *  - d’assurer une cohérence visuelle sur l’ensemble de l’application
 *
 * Il s’appuie sur Radix UI pour gérer correctement
 * les comportements d’accessibilité natifs
 * (focus, disabled, association avec les champs).
 *
 * Ce composant est utilisé dans tous les formulaires
 * de l’application WithYou
 * (authentification, création de salon, paramètres, recherche).
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
