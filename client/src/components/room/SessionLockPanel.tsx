import { useEffect, useState } from "react";
import { Lock, MessageCircleOff, EyeOff, Shield, X, Save } from "lucide-react";
import { Button } from "../ui/Button";
import { Switch } from "../ui/switch";

export interface SessionLockState {
  roomLocked: boolean;
  chatDisabled: boolean;
  focusMode: boolean;
  updatedBy?: string;
  updatedAt?: number;
}

interface SessionLockPanelProps {
  isOpen: boolean;
  value: SessionLockState;
  onClose: () => void;
  onApply: (nextState: SessionLockState) => Promise<void> | void;
  theme?: "light" | "dark";
}

const LOCK_ITEMS = [
  {
    key: "roomLocked" as const,
    title: "Salle verrouillee",
    description: "Bloque les nouvelles entrees sur les navigateurs qui recoivent l'etat du salon.",
    icon: Lock,
    accent: "text-amber-400",
  },
  {
    key: "chatDisabled" as const,
    title: "Chat desactive",
    description: "Les participants ne peuvent plus envoyer de messages tant que la restriction est active.",
    icon: MessageCircleOff,
    accent: "text-red-400",
  },
  {
    key: "focusMode" as const,
    title: "Mode focus",
    description: "Masque le chat des spectateurs pour recentrer la session sur la video.",
    icon: EyeOff,
    accent: "text-blue-400",
  },
];

export function SessionLockPanel({
  isOpen,
  value,
  onClose,
  onApply,
  theme = "dark",
}: SessionLockPanelProps) {
  const [draft, setDraft] = useState<SessionLockState>(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSaving(false);
    }
    setDraft(value);
  }, [isOpen, value]);

  if (!isOpen) return null;

  const activeCount = [draft.roomLocked, draft.chatDisabled, draft.focusMode].filter(Boolean).length;

  const handleApply = async () => {
    setSaving(true);
    try {
      await onApply(draft);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative mx-4 w-full max-w-2xl rounded-2xl border shadow-2xl ${
          theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
        }`}
      >
        <div className={`flex items-center justify-between border-b px-6 py-5 ${
          theme === "dark" ? "border-zinc-800" : "border-gray-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600/15">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className={theme === "dark" ? "text-white" : "text-black"}>Verrouillage de session</h2>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Controlez rapidement l'acces et l'attention pendant la seance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:bg-zinc-800 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-black"
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div
            className={`rounded-xl border p-4 ${
              theme === "dark" ? "border-zinc-800 bg-zinc-800/60" : "border-gray-200 bg-gray-50"
            }`}
          >
            <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {activeCount === 0
                ? "Aucune restriction active actuellement."
                : `${activeCount} restriction(s) active(s) pour le salon.`}
            </p>
          </div>

          <div className="space-y-3">
            {LOCK_ITEMS.map((item) => {
              const Icon = item.icon;
              const checked = draft[item.key];

              return (
                <div
                  key={item.key}
                  className={`rounded-xl border p-4 ${
                    theme === "dark" ? "border-zinc-800 bg-zinc-950/50" : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 ${item.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>
                          {item.title}
                        </p>
                        <p className={`mt-1 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <Switch
                      checked={checked}
                      onCheckedChange={(nextChecked) =>
                        setDraft((prev) => ({ ...prev, [item.key]: nextChecked }))
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`rounded-xl border p-4 ${
            theme === "dark" ? "border-zinc-800 bg-zinc-800/40" : "border-gray-200 bg-gray-50"
          }`}>
            <p className={`text-xs uppercase tracking-[0.18em] ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
              Effet visible
            </p>
            <p className={`mt-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Les participants deja presents recoivent le changement en direct. Le verrouillage d'entree reste une protection
              legere tant qu'il n'y a pas de persistance dediee en base.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleApply}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Application..." : "Appliquer les restrictions"}
          </Button>
        </div>
      </div>
    </div>
  );
}
