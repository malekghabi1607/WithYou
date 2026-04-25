import { useEffect, useState } from "react";
import { Clock3, Pause, Play, Save, Sparkles, X } from "lucide-react";
import { Button } from "../ui/Button";

export interface SessionInterludeDraft {
  enabled: boolean;
  message: string;
  durationMinutes: number;
}

interface SessionInterludePanelProps {
  isOpen: boolean;
  value: SessionInterludeDraft;
  onClose: () => void;
  onApply: (nextState: SessionInterludeDraft) => Promise<void> | void;
  theme?: "light" | "dark";
}

const DURATION_PRESETS = [
  { label: "Sans minuterie", value: 0 },
  { label: "3 min", value: 3 },
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
];

export function SessionInterludePanel({
  isOpen,
  value,
  onClose,
  onApply,
  theme = "dark",
}: SessionInterludePanelProps) {
  const [draft, setDraft] = useState<SessionInterludeDraft>(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(value);
    if (!isOpen) {
      setSaving(false);
    }
  }, [isOpen, value]);

  if (!isOpen) return null;

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
        className={`relative mx-4 w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl ${
          theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-gray-200 bg-white"
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-red-600/20 via-orange-500/10 to-amber-300/10" />

        <div
          className={`relative flex items-center justify-between border-b px-6 py-5 ${
            theme === "dark" ? "border-zinc-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/15">
              <Sparkles className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className={theme === "dark" ? "text-white" : "text-black"}>Mode interlude</h2>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Affiche un ecran de pause elegant a tous les participants
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

        <div className="relative space-y-5 p-6">
          <div
            className={`rounded-2xl border p-4 ${
              theme === "dark" ? "border-zinc-800 bg-zinc-900/80" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, enabled: !prev.enabled }))}
                className={draft.enabled ? "bg-red-600 hover:bg-red-700 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-white"}
              >
                {draft.enabled ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {draft.enabled ? "Interlude actif" : "Activer l'interlude"}
              </Button>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {draft.enabled
                  ? "Le player affichera un ecran de pause stylise."
                  : "Active le mode pour preparer une pause visible par tous."}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>
              Message affiche a l'ecran
            </label>
            <textarea
              value={draft.message}
              onChange={(e) => setDraft((prev) => ({ ...prev, message: e.target.value.slice(0, 140) }))}
              rows={4}
              placeholder="Ex: Pause en cours - reprise dans 5 minutes"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                theme === "dark"
                  ? "border-zinc-700 bg-zinc-900 text-white placeholder:text-gray-500 focus:border-red-500"
                  : "border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-red-500"
              }`}
            />
            <div className="flex items-center justify-between text-xs">
              <span className={theme === "dark" ? "text-gray-500" : "text-gray-600"}>
                Utilise un message court et visible pour la pause
              </span>
              <span className={theme === "dark" ? "text-gray-500" : "text-gray-600"}>
                {draft.message.trim().length}/140
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-amber-400" />
              <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>
                Duree du compte a rebours
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DURATION_PRESETS.map((preset) => {
                const active = draft.durationMinutes === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, durationMinutes: preset.value }))}
                    className={`rounded-2xl border px-3 py-3 text-sm transition ${
                      active
                        ? "border-red-500 bg-red-600 text-white"
                        : theme === "dark"
                          ? "border-zinc-800 bg-zinc-900 text-gray-300 hover:border-zinc-700 hover:text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`rounded-2xl border p-4 ${
              theme === "dark" ? "border-zinc-800 bg-gradient-to-br from-zinc-900 to-black" : "border-gray-200 bg-gray-50"
            }`}
          >
            <p className={`text-xs uppercase tracking-[0.18em] ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
              Apercu
            </p>
            <p className={`mt-3 text-lg font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
              {draft.message.trim() || "Pause en cours - reprise tres bientot"}
            </p>
            <p className={`mt-2 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {draft.durationMinutes > 0
                ? `Un compte a rebours de ${draft.durationMinutes} minute(s) sera affiche au-dessus du player.`
                : "Le mode reste actif jusqu'a ce que la regie le coupe manuellement."}
            </p>
          </div>

          <Button
            type="button"
            onClick={handleApply}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Enregistrement..." : "Appliquer l'interlude"}
          </Button>
        </div>
      </div>
    </div>
  );
}
