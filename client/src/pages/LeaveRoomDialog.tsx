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
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
  theme?: "light" | "dark";
}

export function LeaveRoomDialog({ onConfirm, onCancel, theme = "dark" }: LeaveRoomDialogProps) {
  return (
    <AlertDialog open={true} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className={theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}>
        <AlertDialogHeader>
          <AlertDialogTitle className={theme === "dark" ? "text-white" : "text-black"}>
            Quitter le salon ?
          </AlertDialogTitle>
          <AlertDialogDescription className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            Êtes-vous sûr de vouloir quitter ce salon ? Vous pourrez le rejoindre 
            à nouveau plus tard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className={theme === "dark" ? "border-zinc-700 text-gray-300 hover:bg-zinc-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}
          >
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Quitter
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}