/**
 * Projet : WithYou
 * Fichier : components/ui/switch.tsx
 *
 * Description :
 * Composant interrupteur (Switch) réutilisable utilisé pour activer
 * ou désactiver des options dans l’interface utilisateur.
 *
 * Ce composant permet :
 *  - de représenter des choix booléens (on / off)
 *  - d’offrir une interaction claire et intuitive à l’utilisateur
 *  - de garantir une cohérence visuelle avec le design system
 *  - de respecter les bonnes pratiques d’accessibilité
 *
 * Il s’appuie sur Radix UI pour gérer correctement
 * les comportements interactifs et les états (checked, disabled, focus).
 *
 * Ce composant est principalement utilisé dans
 * les formulaires de configuration et de paramètres
 * (création de salon, réglages de permissions, options utilisateur).
 */



"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
