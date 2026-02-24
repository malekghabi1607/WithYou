/**
 * TermsDialog Component
 * --------------------
 * Ce composant affiche une fenêtre modale contenant
 * les Conditions d’Utilisation de la plateforme WithYou.
 *
 * Fonctionnalités principales :
 * - Affichage des conditions dans une boîte de dialogue
 * - Contenu long avec zone de défilement (ScrollArea)
 * - Possibilité d’accepter ou de refuser les conditions
 * - Blocage de la progression tant que les conditions ne sont pas acceptées
 *
 * Comportement :
 * - Le dialogue s’ouvre selon l’état `open`
 * - Le bouton "Accepter" valide les conditions
 * - Le bouton "Refuser" ferme la fenêtre et annule l’action
 *
 * UI / UX :
 * - Basé sur le composant Dialog du design system
 * - Interface claire, lisible et accessible
 * - Design cohérent avec le reste de l’application
 */
import { Button } from "../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";

interface TermsDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function TermsDialog({ open, onAccept, onDecline }: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Conditions d&apos;utilisation</DialogTitle>
          <DialogDescription>
            Veuillez lire et accepter les conditions d&apos;utilisation pour continuer
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 text-sm text-gray-700">
            <section>
              <h3 className="text-purple-900 mb-2">1. Acceptation des conditions</h3>
              <p>
                En utilisant WithYou, vous acceptez d&apos;être lié par ces conditions d&apos;utilisation. 
                Si vous n&apos;acceptez pas ces conditions, vous ne pouvez pas utiliser nos services.
              </p>
            </section>

            <section>
              <h3 className="text-purple-900 mb-2">2. Description du service</h3>
              <p>
                WithYou est une plateforme de visionnage collaboratif de vidéos permettant à 
                plusieurs utilisateurs de regarder ensemble des contenus vidéo en temps réel 
                et d&apos;interagir via un chat instantané.
              </p>
            </section>

            <section>
              <h3 className="text-purple-900 mb-2">3. Utilisation du service</h3>
              <p>Vous vous engagez à :</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Fournir des informations exactes lors de votre inscription</li>
                <li>Maintenir la sécurité de votre compte et mot de passe</li>
                <li>Ne pas partager votre compte avec d&apos;autres personnes</li>
                <li>Respecter les autres utilisateurs de la plateforme</li>
                <li>Ne pas utiliser le service à des fins illégales ou non autorisées</li>
              </ul>
            </section>

            <section>
              <h3 className="text-purple-900 mb-2">4. Contenu utilisateur</h3>
              <p>
                Vous êtes responsable du contenu que vous partagez sur WithYou, incluant 
                les messages du chat, les liens vidéo, et toute autre interaction. Vous 
                garantissez avoir les droits nécessaires pour partager ce contenu.
              </p>
            </section>

            <section>
              <h3 className="text-purple-900 mb-2">5. Conduite interdite</h3>
              <p>Il est interdit de :</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Harceler, menacer ou intimider d&apos;autres utilisateurs</li>
                <li>Publier du contenu offensant, discriminatoire ou illégal</li>
                <li>Usurper l&apos;identité d&apos;une autre personne</li>
                <li>Perturber le fonctionnement normal du service</li>
                <li>Utiliser des bots ou scripts automatisés</li>
              </ul>
            </section>

            <section>
              <h3 className="text-purple-900 mb-2">6. Propriété intellectuelle</h3>
              <p>
                Tous les droits de propriété intellectuelle relatifs à WithYou et son contenu 
                restent la propriété de leurs détenteurs respectifs.
              </p>
            </section>

            <section>
              <h3 className="text-purple-900 mb-2">7. Protection des données</h3>
              <p>
                Nous nous engageons à protéger vos données personnelles conformément à notre 
                politique de confidentialité. WithYou n&apos;est pas conçu pour collecter des 
                informations personnelles sensibles (PII).
              </p>
            </section>

            <section>
              <h3 className="text-purple-900 mb-2">8. Limitation de responsabilité</h3>
              <p>
                WithYou est fourni &quot;tel quel&quot; sans garantie d&apos;aucune sorte. Nous ne sommes 
                pas responsables des dommages résultant de l&apos;utilisation du service.
              </p>
            </section>

            <section>
              <h3 className="text-purple-900 mb-2">9. Modification des conditions</h3>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout moment. 
                Les utilisateurs seront informés des changements significatifs.
              </p>
            </section>

            <section>
              <h3 className="text-purple-900 mb-2">10. Résiliation</h3>
              <p>
                Nous nous réservons le droit de suspendre ou de résilier votre compte en 
                cas de violation de ces conditions d&apos;utilisation.
              </p>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onDecline}>
            Refuser
          </Button>
          <Button onClick={onAccept}>
            Accepter les conditions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
