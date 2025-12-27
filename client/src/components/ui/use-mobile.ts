
/**
 * Projet : WithYou
 * Fichier : hooks/use-is-mobile.ts
 *
 * Description :
 * Hook React permettant de détecter si l’application
 * est affichée sur un écran mobile.
 *
 * Il retourne :
 *  - true si la largeur de l’écran est inférieure à 768px
 *  - false sinon
 *
 * Ce hook est utilisé pour adapter l’interface utilisateur
 * (sidebar, navigation, layout) entre mobile et desktop.
 */


import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
