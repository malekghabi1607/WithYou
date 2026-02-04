/**
 * Projet : WithYou – Plateforme de visionnage collaboratif
 * Fichier : Collapsible.tsx
 *
 * Description :
 * Composant Collapsible basé sur Radix UI permettant
 * d’afficher ou masquer du contenu de manière interactive.
 *
 * Il est utilisé pour créer des sections repliables
 * (accordéons simples, options avancées, détails cachés, etc.)
 * tout en garantissant l’accessibilité (ARIA, clavier).
 *
 * Composants fournis :
 *  - Collapsible : conteneur principal
 *  - CollapsibleTrigger : élément déclencheur (bouton, texte, icône)
 *  - CollapsibleContent : contenu affiché ou masqué
 *
 * Fonctionnalités :
 *  - Gestion automatique de l’état ouvert / fermé
 *  - Accessibilité native via Radix UI
 *  - Intégration facile avec Tailwind CSS
 *  - Compatible Next.js (client-side)
 *
 * Technologies :
 *  - React
 *  - Radix UI
 *//**
 * Projet : WithYou – Plateforme de visionnage collaboratif
 * Fichier : Collapsible.tsx
 *
 * Description :
 * Composant Collapsible basé sur Radix UI permettant
 * d’afficher ou masquer du contenu de manière interactive.
 *
 * Il est utilisé pour créer des sections repliables
 * (accordéons simples, options avancées, détails cachés, etc.)
 * tout en garantissant l’accessibilité (ARIA, clavier).
 *
 * Composants fournis :
 *  - Collapsible : conteneur principal
 *  - CollapsibleTrigger : élément déclencheur (bouton, texte, icône)
 *  - CollapsibleContent : contenu affiché ou masqué
 *
 * Fonctionnalités :
 *  - Gestion automatique de l’état ouvert / fermé
 *  - Accessibilité native via Radix UI
 *  - Intégration facile avec Tailwind CSS
 *  - Compatible Next.js (client-side)
 *
 * Technologies :
 *  - React
 *  - Radix UI
 */

 
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
