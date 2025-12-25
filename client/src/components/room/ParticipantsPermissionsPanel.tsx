
/**
 * Projet : WithYou
 * Fichier : components/room/ParticipantsPermissionsPanel.tsx
 *
 * Description :
 * Panneau modal permettant à l’administrateur du salon de gérer
 * les permissions des participants.
 *
 * Fonctionnalités principales :
 * - Affichage de la liste des participants du salon
 * - Distinction des rôles (administrateur / membre)
 * - Activation ou désactivation des permissions :
 *    • Chat
 *    • Contrôle de la vidéo
 * - Exclusion (kick) d’un participant
 *
 * Objectif :
 * - Donner un contrôle précis à l’administrateur
 * - Garantir une bonne modération du salon
 * - Adapter les droits des membres en temps réel
 *
 * Remarque :
 * - L’administrateur possède toutes les permissions par défaut
 * - Les membres peuvent avoir des permissions limitées
 */


import { useState } from "react";
import { Button } from "../ui/button";
import { X, MessageSquare, Video, Trash2, Crown, Users as UsersIcon } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  role: "admin" | "member";
  avatar: string;
  permissions: {
    chat: boolean;
    video: boolean;
    kick: boolean;
  };
}

interface ParticipantsPermissionsPanelProps {
  onClose: () => void;
  participants: Participant[];
  onUpdateParticipants?: (participants: Participant[]) => void;
  theme?: "light" | "dark";
}

export function ParticipantsPermissionsPanel({ onClose, participants: initialParticipants, onUpdateParticipants, theme = "dark" }: ParticipantsPermissionsPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>(
    initialParticipants.map(p => ({
      ...p,
      permissions: p.permissions || { chat: true, video: false, kick: false }
    }))
  );

  const togglePermission = (id: string, permission: keyof Participant["permissions"]) => {
    setParticipants(participants.map(p => 
      p.id === id 
        ? { ...p, permissions: { ...p.permissions, [permission]: !p.permissions[permission] } }
        : p
    ));
  };

  const kickParticipant = (id: string) => {
    const updatedParticipants = participants.filter(p => p.id !== id);
    setParticipants(updatedParticipants);
    if (onUpdateParticipants) {
      onUpdateParticipants(updatedParticipants);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'} border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-lg font-semibold`}>
                Gestion des permissions
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                {participants.length} participants
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-zinc-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className={`px-6 py-3 ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-gray-50'} border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between text-xs">
            <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
              Légende :
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Chat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-green-500" />
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Contrôle vidéo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Retirer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}
              >
                <div className="flex items-center justify-between">
                  {/* Participant Info */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {participant.role === "admin" && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center border-2 border-zinc-900">
                          <Crown className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-medium flex items-center gap-2`}>
                        {participant.name}
                        {participant.role === "admin" && (
                          <span className="text-xs text-red-500">(Admin)</span>
                        )}
                      </p>
                      <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} text-xs`}>
                        {participant.role === "admin" ? "Administrateur" : "Membre"}
                      </p>
                    </div>
                  </div>

                  {/* Permissions */}
                  {participant.role === "member" && (
                    <div className="flex items-center gap-2">
                      {/* Chat Permission */}
                      <button
                        onClick={() => togglePermission(participant.id, "chat")}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          participant.permissions.chat
                            ? "bg-blue-500/20 text-blue-500"
                            : theme === 'dark' ? "bg-zinc-700 text-gray-500" : "bg-gray-200 text-gray-400"
                        }`}
                        title="Chat"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {/* Video Permission */}
                      <button
                        onClick={() => togglePermission(participant.id, "video")}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          participant.permissions.video
                            ? "bg-green-500/20 text-green-500"
                            : theme === 'dark' ? "bg-zinc-700 text-gray-500" : "bg-gray-200 text-gray-400"
                        }`}
                        title="Contrôle vidéo"
                      >
                        <Video className="w-4 h-4" />
                      </button>

                      {/* Kick Button */}
                      <button
                        onClick={() => kickParticipant(participant.id)}
                        className="w-10 h-10 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all"
                        title="Retirer du salon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {participant.role === "admin" && (
                    <div className="text-gray-500 text-xs">
                      Toutes les permissions
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
          <Button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white h-10"
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}