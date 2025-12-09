import { useState } from "react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Play, Camera, Mic, Volume2, Shield, Check, X } from "lucide-react";

interface RoomRulesPageProps {
  roomId: string;
  roomName?: string;
  onAccept: () => void;
  onNavigate: (page: string) => void;
  theme?: "light" | "dark";
}

export function RoomRulesPage({ roomId, roomName, onAccept, onNavigate, theme = "dark" }: RoomRulesPageProps) {
  const [acceptCamera, setAcceptCamera] = useState(false);
  const [acceptMic, setAcceptMic] = useState(false);
  const [acceptAudio, setAcceptAudio] = useState(false);
  const [acceptConduct, setAcceptConduct] = useState(false);

  // Au moins une condition doit être acceptée (au lieu de toutes)
  const atLeastOneAccepted = acceptCamera || acceptMic || acceptAudio || acceptConduct;

  const rules = [
    {
      icon: Camera,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      title: "Caméra",
      description: "Vous pouvez activer votre caméra pour partager votre vidéo avec les autres participants. La caméra est optionnelle.",
      checked: acceptCamera,
      onChange: setAcceptCamera,
      checkText: "J'accepte les conditions d'utilisation de la caméra",
      checkSubText: "La caméra est optionnelle et peut être activée/désactivée à tout moment"
    },
    {
      icon: Mic,
      color: "text-green-500",
      bgColor: "bg-green-500/20",
      title: "Microphone",
      description: "Le microphone peut être utilisé pour communiquer avec les autres membres. Respectez les règles de bienséance.",
      checked: acceptMic,
      onChange: setAcceptMic,
      checkText: "J'accepte les conditions d'utilisation du microphone",
      checkSubText: "Le microphone doit être utilisé de manière respectueuse"
    },
    {
      icon: Volume2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      title: "Audio",
      description: "L'audio de la vidéo sera synchronisé pour tous les participants. Assurez-vous d'avoir des haut-parleurs ou un casque.",
      checked: acceptAudio,
      onChange: setAcceptAudio,
      checkText: "J'ai des haut-parleurs ou un casque fonctionnels",
      checkSubText: "Nécessaire pour profiter de l'expérience audio synchronisée"
    },
    {
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-500/20",
      title: "Règles de conduite",
      description: "Respectez les autres membres, pas de contenu offensant, et suivez les instructions de l'administrateur.",
      checked: acceptConduct,
      onChange: setAcceptConduct,
      checkText: "J'accepte de respecter les règles de conduite",
      checkSubText: "Comportement respectueux envers tous les participants"
    }
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="bg-black border-b border-zinc-800 px-8 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-white text-xl font-semibold">WITHYOU</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white hover:bg-zinc-800">
              Connexion
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white px-6">
              S'inscrire
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-white text-5xl font-bold mb-4 tracking-wide">
              RÈGLES DU SALON
            </h1>
            {roomName && (
              <p className="text-red-500 text-2xl font-semibold mb-2">
                {roomName}
              </p>
            )}
            <p className="text-gray-400 text-base">
              Veuillez accepter au moins une condition avant de rejoindre
            </p>
          </div>

          {/* Rules Cards - 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Caméra */}
            <div className="bg-zinc-800/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 p-3 rounded-lg shrink-0">
                  <Camera className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2 text-lg">
                    Caméra
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Vous pouvez activer votre caméra pour partager votre vidéo avec les autres participants. La caméra est optionnelle.
                  </p>
                </div>
              </div>
            </div>

            {/* Microphone */}
            <div className="bg-zinc-800/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-500/20 p-3 rounded-lg shrink-0">
                  <Mic className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2 text-lg">
                    Microphone
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Le microphone peut être utilisé pour communiquer avec les autres membres. Respectez les règles de bienséance.
                  </p>
                </div>
              </div>
            </div>

            {/* Audio */}
            <div className="bg-zinc-800/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-500/20 p-3 rounded-lg shrink-0">
                  <Volume2 className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2 text-lg">
                    Audio
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    L'audio de la vidéo sera synchronisé pour tous les participants. Assurez-vous d'avoir des haut-parleurs ou un casque.
                  </p>
                </div>
              </div>
            </div>

            {/* Règles de conduite */}
            <div className="bg-zinc-800/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-red-500/20 p-3 rounded-lg shrink-0">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2 text-lg">
                    Règles de conduite
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Respectez les autres membres, pas de contenu offensant, et suivez les instructions de l'administrateur.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkboxes Section */}
          <div className="bg-zinc-800/50 rounded-xl p-6 mb-6">
            <div className="space-y-4">
              {/* Camera Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={acceptCamera}
                  onCheckedChange={setAcceptCamera}
                  className="mt-0.5 border-zinc-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Camera className="w-4 h-4 text-blue-500" />
                    <p className="text-white text-sm">
                      J'accepte les conditions d'utilisation de la caméra
                    </p>
                  </div>
                  <p className="text-gray-500 text-xs">
                    La caméra est optionnelle et peut être activée/désactivée à tout moment
                  </p>
                </div>
              </label>

              {/* Microphone Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={acceptMic}
                  onCheckedChange={setAcceptMic}
                  className="mt-0.5 border-zinc-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mic className="w-4 h-4 text-green-500" />
                    <p className="text-white text-sm">
                      J'accepte les conditions d'utilisation du microphone
                    </p>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Le microphone doit être utilisé de manière respectueuse
                  </p>
                </div>
              </label>

              {/* Audio Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={acceptAudio}
                  onCheckedChange={setAcceptAudio}
                  className="mt-0.5 border-zinc-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Volume2 className="w-4 h-4 text-purple-500" />
                    <p className="text-white text-sm">
                      J'ai des haut-parleurs ou un casque fonctionnels
                    </p>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Nécessaire pour profiter de l'expérience audio synchronisée
                  </p>
                </div>
              </label>

              {/* Conduct Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={acceptConduct}
                  onCheckedChange={setAcceptConduct}
                  className="mt-0.5 border-zinc-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-red-500" />
                    <p className="text-white text-sm">
                      J'accepte de respecter les règles de conduite
                    </p>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Comportement respectueux envers tous les participants
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mb-4">
            <Button
              onClick={() => onNavigate('salons')}
              variant="outline"
              className="flex-1 h-12 border-zinc-700 text-white hover:bg-zinc-800 bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={onAccept}
              disabled={!atLeastOneAccepted}
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-red-600/50"
            >
              <Check className="w-4 h-4 mr-2" />
              Accepter et Rejoindre
            </Button>
          </div>

          {/* Warning */}
          <p className="text-gray-500 text-xs text-center">
            En rejoignant ce salon, vous acceptez de respecter ces règles. L'administrateur peut retirer tout membre qui ne les respecte pas.
          </p>
        </div>
      </div>
    </div>
  );
}