/**
 * Checkbox Component
 * ------------------
 * Ce composant représente une case à cocher personnalisée.
 * Il est contrôlé (controlled component) : son état dépend des props reçues.
 *
 * Fonctionnalités principales :
 * - Affichage d’une case cochée ou non cochée
 * - Gestion de l’état désactivé (disabled)
 * - Support de l’accessibilité via les attributs ARIA
 * - Personnalisation du style via Tailwind CSS
 *
 * Comportement :
 * - Lorsque l’utilisateur clique sur la case, la fonction
 *   onCheckedChange est appelée avec la nouvelle valeur (true / false).
 * - Si le composant est désactivé, aucun clic n’est pris en compte.
 * - L’icône de validation s’affiche uniquement lorsque la case est cochée.
 *
 * Accessibilité :
 * - Utilisation du rôle "checkbox"
 * - Attribut aria-checked pour indiquer l’état actuel
 *
 * Props :
 * @param checked         Indique si la case est cochée ou non
 * @param onCheckedChange Fonction appelée lors du changement d’état
 * @param disabled        Désactive la case si true
 * @param className       Classes CSS supplémentaires pour personnaliser le style
 *
 * Implémentation :
 * - Utilise React.forwardRef pour permettre l’accès au bouton depuis un parent
 * - Basé sur un élément <button> pour un meilleur contrôle du style
 */


import * as React from "react";
import { Check } from "lucide-react";

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked = false, onCheckedChange, disabled = false, className = "" }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={`
          w-5 h-5 rounded border-2 flex items-center justify-center
          transition-all duration-200
          ${checked 
            ? 'bg-red-600 border-red-600' 
            : 'bg-transparent border-gray-600 hover:border-red-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" />}
      </button>
    );
  }
);

Checkbox.displayName = "Checkbox";
