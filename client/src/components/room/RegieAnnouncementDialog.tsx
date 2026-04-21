import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/textarea";
import { Megaphone, Send, X } from "lucide-react";

interface RegieAnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void> | void;
  theme?: "light" | "dark";
}

export function RegieAnnouncementDialog({
  isOpen,
  onClose,
  onSubmit,
  theme = "dark",
}: RegieAnnouncementDialogProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setSending(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      await onSubmit(trimmed);
      setMessage("");
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg mx-4 rounded-2xl border p-6 shadow-2xl ${
          theme === "dark"
            ? "bg-zinc-900 border-zinc-800"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={theme === "dark" ? "text-white" : "text-black"}>
                Annonce de la regie
              </h2>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Envoyez un message visible a tous les participants
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:text-white hover:bg-zinc-800"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: Pause dans 5 minutes..."
            maxLength={180}
            rows={4}
            className={`resize-none ${
              theme === "dark"
                ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                : "bg-gray-50 border-gray-300 text-black placeholder:text-gray-400"
            }`}
          />

          <div className="flex items-center justify-between text-xs">
            <span className={theme === "dark" ? "text-gray-500" : "text-gray-600"}>
              Message court recommande pour une lecture rapide
            </span>
            <span className={theme === "dark" ? "text-gray-500" : "text-gray-600"}>
              {message.trim().length}/180
            </span>
          </div>

          <div
            className={`rounded-lg border p-3 ${
              theme === "dark"
                ? "bg-zinc-800/60 border-zinc-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
              Apercu
            </p>
            <p
              className={`mt-2 text-sm ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              {message.trim() || "Votre annonce apparaitra ici"}
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black"
            disabled={sending || !message.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Envoi..." : "Envoyer l'annonce"}
          </Button>
        </div>
      </div>
    </div>
  );
}
