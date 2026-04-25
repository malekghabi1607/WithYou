/**
 * Projet : WithYou
 * Fichier : components/room/ParticipantsPermissionsPanel.tsx
 *
 * Panneau de gestion des permissions des participants.
 * Permissions disponibles (par membre) :
 *   - Chat (écrire dans le chat)
 *   - Contrôle vidéo (play/pause/seek)
 *   - Ajouter vidéos à la playlist
 *   - Créer des sondages
 *   - Épingler des messages
 *   - Rôle Régie vidéo
 *   - Kick (expulser du salon)
 */
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import {
  X,
  MessageSquare,
  Video,
  Trash2,
  Crown,
  Users as UsersIcon,
  Clapperboard,
  ListVideo,
  BarChart2,
  Pin,
  VolumeX,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemberPermissions {
  chat: boolean;
  video: boolean;
  playlist: boolean;
  polls: boolean;
  pin: boolean;
  muted: boolean;
}

interface Participant {
  id: string;
  name: string;
  role: "admin" | "regie" | "teacher" | "student" | "guest" | "member";
  status?: "online" | "offline";
  avatar: string;
  permissions: MemberPermissions;
}

interface ParticipantsPermissionsPanelProps {
  participants: Array<{
    id: string;
    name: string;
    role: "admin" | "regie" | "teacher" | "student" | "guest" | "member";
    status?: "online" | "offline";
    avatar: string;
    permissions?: Partial<MemberPermissions>;
  }>;
  onClose: () => void;
  onUpdatePermissions?: (participants: any[]) => void;
  onAssignRegie?: (participantId: string, enabled: boolean) => void | Promise<void>;
  theme?: "light" | "dark";
  isReadOnly?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getRoleLabel = (role: string) => {
  switch (role) {
    case "admin": return "Administrateur";
    case "regie": return "Régie vidéo";
    case "teacher": return "Professeur";
    case "student": return "Étudiant";
    case "guest": return "Invité";
    default: return "Membre";
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin": return "bg-red-600 text-white";
    case "regie": return "bg-orange-500 text-white";
    case "teacher": return "bg-blue-600 text-white";
    case "student": return "bg-emerald-600 text-white";
    default: return "bg-zinc-600 text-white";
  }
};

const defaultPermissions = (role: string): MemberPermissions => {
  if (role === "admin") {
    return { chat: true, video: true, playlist: true, polls: true, pin: true, muted: false };
  }
  return { chat: true, video: false, playlist: false, polls: false, pin: false, muted: false };
};

// ─── Permission Button ─────────────────────────────────────────────────────────

interface PermBtnProps {
  active: boolean;
  activeClass: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

function PermBtn({ active, activeClass, icon, label, onClick, disabled, danger }: PermBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all text-xs font-medium min-w-[48px] ${danger
          ? "bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
          : active
            ? activeClass
            : "bg-zinc-700/60 text-gray-500 hover:bg-zinc-600 hover:text-gray-300"
        } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {icon}
      <span className="text-[10px] leading-tight">{label}</span>
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ParticipantsPermissionsPanel({
  participants: initialParticipants,
  onClose,
  onUpdatePermissions,
  onAssignRegie,
  theme = "dark",
  isReadOnly = false,
}: ParticipantsPermissionsPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>(
    initialParticipants.map((p) => ({
      ...p,
      permissions: {
        ...defaultPermissions(p.role),
        ...p.permissions,
      },
    }))
  );

  useEffect(() => {
    setParticipants(
      initialParticipants.map((p) => ({
        ...p,
        permissions: {
          ...defaultPermissions(p.role),
          ...p.permissions,
        },
      }))
    );
  }, [initialParticipants]);

  // Toggle any single permission
  const togglePermission = (id: string, key: keyof MemberPermissions) => {
    setParticipants((prev) => {
      const updated = prev.map((p) =>
        p.id === id
          ? { ...p, permissions: { ...p.permissions, [key]: !p.permissions[key] } }
          : p
      );
      onUpdatePermissions?.(updated.filter((p) => !p.id.startsWith("current-user-")));
      return updated;
    });
  };

  // Kick participant
  const kickParticipant = (id: string) => {
    setParticipants((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      onUpdatePermissions?.(updated.filter((p) => !p.id.startsWith("current-user-")));
      return updated;
    });
  };

  // Toggle regie role
  const handleRegieToggle = async (id: string, makeRegie: boolean) => {
    if (!onAssignRegie) return;
    try {
      await onAssignRegie(id, makeRegie);
      setParticipants((prev) => {
        const updated = prev.map((p) =>
          p.id === id
            ? {
                ...p,
                role: makeRegie ? "regie" : "member",
                // Keep the user's explicit per-permission choices unchanged.
                permissions: { ...p.permissions },
              }
            : p
        );
        onUpdatePermissions?.(updated.filter((p) => !p.id.startsWith("current-user-")));
        return updated;
      });
    } catch (error) {
      console.error("Impossible de mettre à jour le rôle régie", error);
    }
  };

  const dark = theme === "dark";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`${dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
          } border rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${dark ? "border-zinc-800" : "border-gray-200"}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`${dark ? "text-white" : "text-black"} text-lg font-semibold`}>
                {isReadOnly ? "Permissions du salon" : "Gestion des permissions"}
              </h2>
              <p className={`${dark ? "text-gray-400" : "text-gray-600"} text-sm`}>
                {participants.length} participant{participants.length > 1 ? "s" : ""}
                {isReadOnly && " · Lecture seule"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-zinc-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
              }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Légende */}
        <div className={`px-5 py-2 ${dark ? "bg-zinc-800/50" : "bg-gray-50"} border-b ${dark ? "border-zinc-800" : "border-gray-200"}`}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
            <span className="font-medium">Permissions :</span>
            {[
              { icon: <MessageSquare className="w-3 h-3 text-blue-400" />, label: "Chat" },
              { icon: <Video className="w-3 h-3 text-green-400" />, label: "Vidéo" },
              { icon: <ListVideo className="w-3 h-3 text-purple-400" />, label: "Playlist" },
              { icon: <BarChart2 className="w-3 h-3 text-yellow-400" />, label: "Sondages" },
              { icon: <Pin className="w-3 h-3 text-pink-400" />, label: "Épingler" },
              { icon: <VolumeX className="w-3 h-3 text-orange-400" />, label: "Muet" },
              { icon: <Clapperboard className="w-3 h-3 text-red-400" />, label: "Régie" },
              { icon: <Trash2 className="w-3 h-3 text-red-500" />, label: "Kick" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1">
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Participants list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className={`${dark ? "bg-zinc-800 border-zinc-700" : "bg-gray-50 border-gray-200"
                } border rounded-xl p-4`}
            >
              {/* Top row: avatar + name + role badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    {participant.role === "admin" && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center border-2 border-zinc-900">
                        <Crown className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`${dark ? "text-white" : "text-black"} font-medium text-sm flex items-center gap-2`}>
                      {participant.name}
                      {participant.role === "admin" && (
                        <span className="text-xs text-red-400">(Admin)</span>
                      )}
                    </p>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-0.5 ${getRoleBadgeColor(participant.role)}`}>
                      {getRoleLabel(participant.role)}
                    </span>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${participant.status === "online" ? "bg-green-500" : "bg-gray-500"}`} />
              </div>

              {/* Permissions row (only for non-admins) */}
              {participant.role !== "admin" ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {/* Chat */}
                  <PermBtn
                    active={participant.permissions.chat && !participant.permissions.muted}
                    activeClass="bg-blue-500/20 text-blue-400"
                    icon={<MessageSquare className="w-4 h-4" />}
                    label="Chat"
                    onClick={() => togglePermission(participant.id, "chat")}
                    disabled={isReadOnly || participant.permissions.muted}
                  />

                  {/* Vidéo */}
                  <PermBtn
                    active={participant.permissions.video}
                    activeClass="bg-green-500/20 text-green-400"
                    icon={<Video className="w-4 h-4" />}
                    label="Vidéo"
                    onClick={() => togglePermission(participant.id, "video")}
                    disabled={isReadOnly}
                  />

                  {/* Playlist */}
                  <PermBtn
                    active={participant.permissions.playlist}
                    activeClass="bg-purple-500/20 text-purple-400"
                    icon={<ListVideo className="w-4 h-4" />}
                    label="Playlist"
                    onClick={() => togglePermission(participant.id, "playlist")}
                    disabled={isReadOnly}
                  />

                  {/* Sondages */}
                  <PermBtn
                    active={participant.permissions.polls}
                    activeClass="bg-yellow-500/20 text-yellow-400"
                    icon={<BarChart2 className="w-4 h-4" />}
                    label="Sondages"
                    onClick={() => togglePermission(participant.id, "polls")}
                    disabled={isReadOnly}
                  />

                  {/* Épingler */}
                  <PermBtn
                    active={participant.permissions.pin}
                    activeClass="bg-pink-500/20 text-pink-400"
                    icon={<Pin className="w-4 h-4" />}
                    label="Épingler"
                    onClick={() => togglePermission(participant.id, "pin")}
                    disabled={isReadOnly}
                  />

                  {/* Muet */}
                  <PermBtn
                    active={participant.permissions.muted}
                    activeClass="bg-orange-500/20 text-orange-400"
                    icon={<VolumeX className="w-4 h-4" />}
                    label="Muet"
                    onClick={() => togglePermission(participant.id, "muted")}
                    disabled={isReadOnly}
                  />

                  {/* Séparateur */}
                  <div className={`w-px h-10 self-center ${dark ? "bg-zinc-700" : "bg-gray-300"}`} />

                  {/* Régie */}
                  <PermBtn
                    active={participant.role === "regie"}
                    activeClass="bg-red-500/20 text-red-400"
                    icon={<Clapperboard className="w-4 h-4" />}
                    label={participant.role === "regie" ? "Régie ✓" : "Régie"}
                    onClick={() => handleRegieToggle(participant.id, participant.role !== "regie")}
                    disabled={isReadOnly}
                  />

                  {/* Kick */}
                  <PermBtn
                    active={false}
                    activeClass=""
                    danger
                    icon={<Trash2 className="w-4 h-4" />}
                    label="Kick"
                    onClick={() => kickParticipant(participant.id)}
                    disabled={isReadOnly}
                  />
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-1">✓ Toutes les permissions (administrateur)</p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${dark ? "border-zinc-800" : "border-gray-200"}`}>
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
