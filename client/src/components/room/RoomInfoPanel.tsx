


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


import { X, Users, Crown } from "lucide-react";
import { Button } from "../ui/button";

interface RoomInfoPanelProps {
  onClose: () => void;
  roomData: {
    name: string;
    admin: string;
    isCurrentUserAdmin: boolean;
    type: string;
    participants: number;
    maxParticipants: number;
  };
}

export function RoomInfoPanel({ onClose, roomData }: RoomInfoPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl">Salon</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Room Name */}
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Nom du salon</p>
            <p className="text-white">{roomData.name}</p>
          </div>

          {/* Administrator */}
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Administrateur</p>
            <p className="text-white flex items-center gap-2">
              {roomData.admin}
              {roomData.isCurrentUserAdmin && (
                <span className="text-gray-500 text-sm">(Vous)</span>
              )}
            </p>
          </div>

          {/* Type */}
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Type</p>
            <p className="text-white">{roomData.type}</p>
          </div>

          {/* Participants */}
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Participants</p>
            <p className="text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              {roomData.participants}/{roomData.maxParticipants}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}