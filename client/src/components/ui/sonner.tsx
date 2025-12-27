/**
 * Composant Sonner
 *
 * Wrapper autour du composant Toaster de la librairie "sonner".
 * Permet d’afficher des notifications (toast) globales dans l’application.
 *
 * Caractéristiques :
 *  - Thème sombre activé par défaut
 *  - Styles personnalisés via des variables CSS (background, texte, bordures)
 *  - Supporte tous les types de notifications : success, error, info, warning
 *
 * Ce composant doit être monté une seule fois (souvent dans layout.tsx ou App).
 * Compatible avec Next.js côté client ("use client").
 */

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };