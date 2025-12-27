/**
 * Projet : WithYou
 * Fichier : components/dialogs/LeaveRoomDialog.tsx
 *
 * Description :
 * Boîte de dialogue de confirmation pour quitter un salon.
 *
 * Ce composant permet :
 *  - d’afficher une alerte de confirmation
 *  - d’éviter les départs accidentels d’un salon
 *  - de confirmer ou annuler l’action de quitter
 *
 * Il est utilisé lorsqu’un utilisateur
 * souhaite quitter un salon de visionnage.
 */

import { Button } from "../components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

interface LeaveRoomDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LeaveRoomDialog({ open, onConfirm, onCancel }: LeaveRoomDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Quitter le salon ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir quitter ce salon ? Vous pourrez le rejoindre 
            à nouveau plus tard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Quitter
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
