/**
 * Projet : WithYou
 * Fichier : components/room/ShareRoomDialog.tsx
 *
 * Description :
 * Dialog pour partager le code d'invitation et le lien d'un salon.
 * Permet de copier facilement le code ou le lien complet.
 */

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  X, 
  Copy, 
  Check,
  Share2,
  Hash,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";

interface ShareRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  roomName: string;
  theme?: "light" | "dark";
}

export function ShareRoomDialog({ 
  isOpen, 
  onClose, 
  roomCode, 
  roomName,
  theme = "dark" 
}: ShareRoomDialogProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Générer le lien complet (utilisant l'URL actuelle)
  const roomLink = `${window.location.origin}/join-room?code=${roomCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      toast.success("Code copié !");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopiedLink(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Rejoins-moi sur WithYou - ${roomName}`,
      text: `Je t'invite à rejoindre mon salon "${roomName}" sur WithYou !\n\nCode d'invitation : ${roomCode}`,
      url: roomLink
    };

    try {
      // Créer un texte de partage complet
      const shareText = `${shareData.title}\n\n${shareData.text}\n\nLien : ${shareData.url}`;
      
      // Copier dans le presse-papiers au lieu d'utiliser navigator.share()
      await navigator.clipboard.writeText(shareText);
      toast.success("Invitation copiée dans le presse-papiers !", {
        description: "Vous pouvez maintenant la coller où vous voulez"
      });
    } catch (error: any) {
      console.error('Erreur de partage:', error);
      toast.error("Erreur lors de la copie de l'invitation");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className={`relative ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'} border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Inviter des amis
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                {roomName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-zinc-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'} w-8 h-8 rounded-full flex items-center justify-center transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Code d'invitation */}
          <div>
            <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm mb-2 flex items-center gap-2`}>
              <Hash className="w-4 h-4" />
              Code d'invitation
            </div>
            <div className="flex gap-2 mt-2">
              <div className={`flex-1 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-300'} border rounded-lg px-4 py-3 flex items-center justify-center`}>
                <span className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-2xl font-mono font-bold tracking-wider`}>
                  {roomCode}
                </span>
              </div>
              <Button
                onClick={handleCopyCode}
                className={`${copiedCode ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white px-4`}
              >
                {copiedCode ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} text-xs mt-2`}>
              Partage ce code pour inviter des amis à rejoindre le salon
            </p>
          </div>

          {/* Lien d'invitation */}
          <div>
            <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm mb-2 flex items-center gap-2`}>
              <LinkIcon className="w-4 h-4" />
              Lien d'invitation
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                value={roomLink}
                readOnly
                className={`flex-1 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-700'} font-mono text-sm`}
              />
              <Button
                onClick={handleCopyLink}
                className={`${copiedLink ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white px-4`}
              >
                {copiedLink ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} text-xs mt-2`}>
              Copie et envoie ce lien direct vers le salon
            </p>
          </div>

          {/* Bouton de partage natif */}
          <div className="pt-2">
            <Button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white h-11"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Partager l'invitation
            </Button>
          </div>

          {/* Instructions */}
          <div className={`${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
              💡 <span>Comment inviter :</span>
            </p>
            <ul className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs mt-2 space-y-1 list-disc list-inside`}>
              <li>Partage le code <span className="font-mono">{roomCode}</span> avec tes amis</li>
              <li>Ou envoie-leur directement le lien d'invitation</li>
              <li>Ils pourront rejoindre instantanément le salon</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}