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


import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "./utils"; // garde si ton cn est bien là

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-zinc-700",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block size-4 rounded-full bg-white shadow-lg transition-transform",
        "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitive.Root>
));

Switch.displayName = "Switch";

export { Switch };