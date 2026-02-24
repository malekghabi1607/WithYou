


/**
 * Projet : WithYou
 * Fichier : components/room/RoomInfoPanel.tsx
 *
 * Description :
 * Panneau modal affichant les informations générales d’un salon.
 * Il permet aux participants de consulter rapidement les détails
 * essentiels du salon sans quitter la page principale.
 *
 * Informations affichées :
 * - Nom du salon
 * - Administrateur du salon (avec indication si c’est l’utilisateur courant)
 * - Type de salon (public / privé)
 * - Nombre de participants connectés / capacité maximale
 *
 * Fonctionnement :
 * - Le panneau apparaît sous forme de modal avec fond assombri
 * - Il peut être fermé via le bouton de fermeture (icône X)
 *
 * Objectif :
 * - Offrir une vue synthétique et lisible des informations du salon
 * - Améliorer l’expérience utilisateur et la compréhension du contexte
 */
import { X, Users, Crown, Copy, Check } from "lucide-react";
import { Button } from "../ui/Button";
import { fetchSalonByCode } from "../../api/rooms";
import { fetchParticipants } from "../../api/participants";
import { supabase } from "../../api/supabase";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface RoomInfoPanelProps {
  roomId: string;
  onClose: () => void;
  theme?: "light" | "dark";
  adminName?: string;
  participantsCount?: number;
}

export function RoomInfoPanel({
  roomId,
  onClose,
  theme = "dark",
  adminName,
  participantsCount,
}: RoomInfoPanelProps) {
  const [copied, setCopied] = useState(false);
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSalonByCode(roomId);
        let resolvedAdmin = adminName || "Administrateur";
        let resolvedParticipants = participantsCount ?? 0;

        try {
          const participants = await fetchParticipants(data.id_salon || roomId);
          const activeCount = (participants || []).filter((p) => p.is_active).length;
          if (activeCount > 0) resolvedParticipants = activeCount;
          const admin = (participants || []).find((p) => p.role === "admin");
          if (admin?.name) resolvedAdmin = admin.name;
        } catch {
          // fallback below
        }

        if ((!resolvedAdmin || resolvedAdmin === "Administrateur") && data.owner_id) {
          const { data: ownerData } = await supabase
            .from("users")
            .select("username,email")
            .eq("id_user", data.owner_id)
            .maybeSingle();
          if (ownerData?.username) {
            resolvedAdmin = ownerData.username;
          } else if (ownerData?.email) {
            resolvedAdmin = ownerData.email.split("@")[0];
          }
        }

        setRoom({
          name: data.name,
          creator: resolvedAdmin || "Administrateur",
          isPublic: !!data.is_public,
          participants: resolvedParticipants,
          maxParticipants: data.max_participants || 20,
          joinCode: data.invitation_code ?? data.room_code,
        });
      } catch (error) {
        console.error("Erreur chargement salon", error);
      }
    };

    load();
  }, [roomId, adminName, participantsCount]);
  
  if (!room) {
    return null;
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.joinCode);
    setCopied(true);
    toast.success("Code copié dans le presse-papier !", {
      duration: 2000,
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'} rounded-2xl p-6 w-full max-w-sm border`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-xl`}>Salon</h2>
          <button
            onClick={onClose}
            className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Room Name */}
          <div className={`${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-100'} rounded-lg p-4`}>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-1`}>Nom du salon</p>
            <p className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}>{room.name}</p>
          </div>

          {/* Administrator */}
          <div className={`${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-100'} rounded-lg p-4`}>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-1`}>Administrateur</p>
            <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} flex items-center gap-2`}>
              {room.creator}
              <Crown className="w-4 h-4 text-yellow-500" />
            </p>
          </div>

          {/* Type */}
          <div className={`${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-100'} rounded-lg p-4`}>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-1`}>Type</p>
            <p className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}>{room.isPublic ? "Public" : "Privé"}</p>
          </div>

          {/* Participants */}
          <div className={`${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-100'} rounded-lg p-4`}>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-1`}>Participants</p>
            <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} flex items-center gap-2`}>
              <Users className="w-4 h-4" />
              {room.participants}/{room.maxParticipants}
            </p>
          </div>

          {/* Join Code */}
          <div className={`${theme === 'dark' ? 'bg-red-900/20 border border-red-900/30' : 'bg-red-50 border border-red-200'} rounded-lg p-4`}>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-2`}>Code de participation</p>
            <div className="flex items-center justify-between gap-3">
              <code className={`${theme === 'dark' ? 'text-red-400 bg-black/30' : 'text-red-600 bg-white'} text-lg font-mono tracking-wider px-3 py-2 rounded`}>
                {room.joinCode}
              </code>
              <button
                onClick={handleCopyCode}
                className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : theme === 'dark' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title="Copier le code"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} text-xs mt-2`}>
              💡 Partagez ce code pour inviter des amis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
