/**
 * Projet : WithYou
 * Fichier : pages/JoinWithCodePage.tsx
 *
 * Description :
 * Page permettant à un utilisateur de rejoindre un salon privé
 * à l’aide d’un code d’invitation spécifique.
 *
 * Cette page gère :
 *  - la saisie et la validation du code d’invitation
 *  - la vérification du code (simulation côté front)
 *  - l’affichage de messages de succès ou d’erreur
 *    via des notifications utilisateur
 *  - l’accès au salon après validation du code
 *
 * Elle est utilisée principalement pour les salons privés
 * nécessitant une étape de sécurité supplémentaire
 * avant l’entrée dans le salon.
 *
 * Cette page utilise des composants UI réutilisables
 * (Button, Input, Label)
 * et respecte le thème sombre de l’application.
 *
 * Elle s’intègre dans le flux de navigation
 * depuis la page d’informations du salon
 * et redirige vers l’interface du salon après validation.
 */


import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Video, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface JoinWithCodePageProps {
  roomId: string;
  onNavigate: (page: string) => void;
  onJoinRoom: (roomId: string) => void;
  theme?: "light" | "dark";
}

export function JoinWithCodePage({ roomId, onNavigate, onJoinRoom, theme = "dark" }: JoinWithCodePageProps) {
  const [code, setCode] = useState("");

  // Mock valid code for demo
  const VALID_CODE = "CINEMA2024";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Veuillez entrer un code d'invitation");
      return;
    }

    if (code.toUpperCase() !== VALID_CODE) {
      toast.error("Code d'invitation invalide");
      return;
    }

    toast.success("Code validé ! Accès au salon accordé");
    onJoinRoom(roomId);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <button 
        onClick={() => onNavigate('room-info')}   
          className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
        <div className="flex items-center gap-2">
          <Video className="w-8 h-8 text-red-600" />
          <span className="text-white">WithYou</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-zinc-900 rounded-2xl shadow-2xl shadow-red-600/20 p-8 border border-red-900/20">
          {/* Lock Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/50">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-white text-center mb-2">Salon privé</h1>
          <p className="text-gray-400 text-center mb-8">
            Ce salon est protégé. Entrez le code d'invitation pour rejoindre.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="code" className="text-gray-300">Code d&apos;invitation</Label>
              <Input
                id="code"
                type="text"
                placeholder="Entrez le code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="mt-1 text-center tracking-wider bg-black border-red-900/30 text-white placeholder:text-gray-500"
                maxLength={20}
              />
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg">
              Rejoindre le salon
            </Button>
          </form>

          <div className="mt-8 p-4 bg-black border border-red-900/30 rounded-lg">
            <p className="text-sm text-white mb-2">
              <strong>Où trouver le code ?</strong>
            </p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Demandez au créateur du salon</li>
              <li>• Vérifiez votre invitation par email</li>
              <li>• Consultez le lien partagé</li>
            </ul>
          </div>

          {/* Demo hint */}
          <div className="mt-6 p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
            <p className="text-xs text-red-400 text-center">
              💡 Demo : Utilisez le code <strong className="text-red-500">CINEMA2024</strong>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}