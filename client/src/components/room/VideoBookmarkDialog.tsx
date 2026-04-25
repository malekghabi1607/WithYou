import { useEffect, useState } from "react";
import { BookmarkPlus, Clock3, Send, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface VideoBookmarkDialogProps {
  isOpen: boolean;
  currentTime: number;
  currentVideoTitle?: string;
  onClose: () => void;
  onSubmit: (label: string) => Promise<void> | void;
  theme?: "light" | "dark";
}

function formatSeconds(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function VideoBookmarkDialog({
  isOpen,
  currentTime,
  currentVideoTitle,
  onClose,
  onSubmit,
  theme = "dark",
}: VideoBookmarkDialogProps) {
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLabel("");
      setSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const trimmed = label.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      await onSubmit(trimmed);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative mx-4 w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
          theme === "dark" ? "border-zinc-800 bg-zinc-900" : "border-gray-200 bg-white"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/15">
              <BookmarkPlus className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className={theme === "dark" ? "text-white" : "text-black"}>Ajouter un marque-page</h2>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Creez un repere sur la video en cours
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

        <div className="space-y-4">
          <div
            className={`rounded-xl border p-4 ${
              theme === "dark" ? "border-zinc-800 bg-zinc-800/50" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2 text-sm">
              <Clock3 className="h-4 w-4 text-amber-400" />
              <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Temps capture : <strong>{formatSeconds(currentTime)}</strong>
              </span>
            </div>
            {currentVideoTitle && (
              <p className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
                Video : {currentVideoTitle}
              </p>
            )}
          </div>

          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Point important, introduction, passage cle..."
            maxLength={80}
            className={
              theme === "dark"
                ? "border-zinc-700 bg-zinc-800 text-white placeholder:text-gray-500"
                : "border-gray-300 bg-white text-black placeholder:text-gray-400"
            }
          />

          <div className="flex items-center justify-between text-xs">
            <span className={theme === "dark" ? "text-gray-500" : "text-gray-600"}>
              Utilisez un titre court pour retrouver vite le moment
            </span>
            <span className={theme === "dark" ? "text-gray-500" : "text-gray-600"}>{label.trim().length}/80</span>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-red-600 text-white hover:bg-red-700"
            disabled={!label.trim() || saving}
          >
            <Send className="mr-2 h-4 w-4" />
            {saving ? "Creation..." : "Ajouter le marque-page"}
          </Button>
        </div>
      </div>
    </div>
  );
}
