/**
 * Projet : WithYou – Plateforme de visionnage collaboratif
 * Fichier : AspectRatio.tsx
 *
 * Description :
 * Composant utilitaire permettant de conserver un ratio
 * largeur / hauteur fixe (ex : vidéo, image, player).
 *
 * Basé sur :
 *  - @radix-ui/react-aspect-ratio
 *
 * Utilisation :
 *  - Encapsuler un média (vidéo, image, iframe)
 *  - Garantit un affichage responsive sans déformation
 */

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
