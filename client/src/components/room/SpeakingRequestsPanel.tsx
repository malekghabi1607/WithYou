import { Button } from "../ui/Button";
import { Clock3, Mic, Users, X } from "lucide-react";

export interface SpeakingRequestEntry {
  participantId: string;
  participantName: string;
  participantAvatar: string;
  requestedAt: number;
}

interface SpeakingRequestsPanelProps {
  isOpen: boolean;
  requests: SpeakingRequestEntry[];
  activeSpeaker: SpeakingRequestEntry | null;
  onClose: () => void;
  onApprove: (participantId: string) => void;
  onRemove: (participantId: string) => void;
  onClearActiveSpeaker: () => void;
  theme?: "light" | "dark";
}

const formatWaitLabel = (requestedAt: number) => {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - requestedAt) / 1000));
  if (elapsedSeconds < 60) {
    return `${elapsedSeconds}s`;
  }

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

export function SpeakingRequestsPanel({
  isOpen,
  requests,
  activeSpeaker,
  onClose,
  onApprove,
  onRemove,
  onClearActiveSpeaker,
  theme = "dark",
}: SpeakingRequestsPanelProps) {
  if (!isOpen) return null;

  const dark = theme === "dark";

  return (
    <div className="fixed inset-0 z-[10030] bg-black/70 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`px-4 py-4 border-b flex items-center justify-between ${
            dark ? "border-zinc-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                dark ? "bg-red-600/15 text-red-300" : "bg-red-100 text-red-600"
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${dark ? "text-white" : "text-black"}`}>
                Demandes de parole
              </h2>
              <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
                File d'attente geree par la regie
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`${dark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          <div
            className={`rounded-xl border p-4 ${
              dark ? "bg-zinc-950/60 border-zinc-800" : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`text-xs uppercase tracking-wide ${dark ? "text-gray-500" : "text-gray-500"}`}>
                  Prise de parole en cours
                </p>
                <p className={`mt-1 text-sm font-medium ${dark ? "text-white" : "text-black"}`}>
                  {activeSpeaker ? activeSpeaker.participantName : "Aucun participant"}
                </p>
              </div>

              {activeSpeaker && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClearActiveSpeaker}
                  className={`${dark ? "text-gray-300 hover:text-white hover:bg-zinc-800" : "text-gray-700 hover:text-black hover:bg-gray-100"}`}
                >
                  Terminer
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <div
                className={`rounded-xl border p-5 text-center ${
                  dark ? "border-zinc-800 bg-zinc-950/40 text-gray-400" : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune main levee pour le moment.</p>
              </div>
            ) : (
              requests.map((request, index) => (
                <div
                  key={request.participantId}
                  className={`rounded-xl border p-4 ${
                    dark ? "border-zinc-800 bg-zinc-950/40" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={request.participantAvatar}
                          alt={request.participantName}
                          className="w-11 h-11 rounded-full object-cover"
                        />
                        <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${dark ? "text-white" : "text-black"}`}>
                          {request.participantName}
                        </p>
                        <div className={`mt-1 flex items-center gap-1 text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
                          <Clock3 className="w-3.5 h-3.5" />
                          En attente depuis {formatWaitLabel(request.requestedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onApprove(request.participantId)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Mic className="w-4 h-4" />
                        Donner la parole
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemove(request.participantId)}
                        className={`${dark ? "text-gray-300 hover:text-white hover:bg-zinc-800" : "text-gray-700 hover:text-black hover:bg-gray-100"}`}
                      >
                        Retirer
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
