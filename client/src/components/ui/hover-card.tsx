/**
 * Projet : WithYou – Plateforme de visionnage collaboratif
 * Fichier : HoverCard.tsx
 *
 * Description :
 * Composant HoverCard basé sur Radix UI permettant
 * d’afficher une carte d’information contextuelle
 * lors du survol (hover) d’un élément.
 *
 * Il est utilisé pour montrer des informations rapides
 * sans interaction de clic, par exemple :
 *  - aperçu d’un utilisateur
 *  - informations complémentaires
 *  - détails d’un élément
 *
 * Composants fournis :
 *  - HoverCard : conteneur principal
 *  - HoverCardTrigger : élément déclencheur au survol
 *  - HoverCardContent : contenu affiché
 *
 * Fonctionnalités :
 *  - Apparition au survol (hover)
 *  - Animation fluide d’ouverture / fermeture
 *  - Positionnement automatique (haut, bas, gauche, droite)
 *  - Accessibilité intégrée
 *  - Stylisation avec Tailwind CSS
 *  - Compatible Next.js (client-side)
 *
 * Technologies :
 *  - React
 *  - Radix UI (Hover Card)
 *  - Tailwind CSS
 */


import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "./utils";

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
