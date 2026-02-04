/**
 * Projet : WithYou
 * Fichier : components/ui/Logo.tsx
 *
 * Description :
 * Composant Logo de l'application WithYou.
 * Logo interactif avec icône Play et texte "WITHYOU".
 *
 * Gère :
 *  - Trois tailles disponibles (sm, md, lg)
 *  - Effet de glow animé rouge
 *  - Effet hover avec scale
 *  - Adaptation au thème clair/sombre
 *  - Option pour afficher/masquer le texte
 *
 * Utilisé dans Header, RoomPage, et toutes les pages publiques.
 */

import { Play } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  theme?: "light" | "dark";
}

export function Logo({ size = "md", showText = true, className = "", theme = "dark" }: LogoProps) {
  const sizes = {
    sm: { 
      icon: "w-6 h-6", 
      text: "text-xl", 
      container: "gap-2",
      iconPadding: "p-1.5",
      iconSize: "w-8 h-8"
    },
    md: { 
      icon: "w-8 h-8", 
      text: "text-2xl", 
      container: "gap-2.5",
      iconPadding: "p-2",
      iconSize: "w-10 h-10"
    },
    lg: { 
      icon: "w-10 h-10", 
      text: "text-4xl", 
      container: "gap-3",
      iconPadding: "p-2.5",
      iconSize: "w-14 h-14"
    }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      {/* Netflix Style Logo Icon */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-red-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-glow"></div>
        
        {/* Icon container */}
        <div className={`relative bg-gradient-to-br from-red-600 to-red-800 rounded-lg ${currentSize.iconPadding} shadow-xl transform group-hover:scale-105 transition-transform ${currentSize.iconSize} flex items-center justify-center`}>
          <Play className={`${currentSize.icon} text-white fill-white`} />
        </div>
      </div>
      
      {showText && (
        <div className="flex items-baseline gap-1">
          <span className={`${currentSize.text} tracking-tight font-display ${theme === "dark" ? "text-red-500" : "text-red-600"}`} style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            WITHYOU
          </span>
        </div>
      )}
    </div>
  );
}