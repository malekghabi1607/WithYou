/**
 * Projet : WithYou
 * Fichier : components/ui/textarea.tsx
 *
 * Description :
 * Composant champ de saisie multi-ligne (Textarea) réutilisable
 * utilisé dans les formulaires de l’application.
 *
 * Ce composant permet :
 *  - la saisie de textes plus longs (descriptions, messages, commentaires)
 *  - une gestion cohérente du style sur toutes les pages
 *  - la prise en charge des états focus, disabled et invalid
 *  - le respect des bonnes pratiques d’accessibilité
 *
 * Il s’intègre au design system de WithYou
 * et s’adapte automatiquement aux thèmes clair et sombre.
 *
 * Ce composant est utilisé notamment pour
 * la description des salons, les messages de chat
 * et les formulaires de paramètres.
 */

import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
