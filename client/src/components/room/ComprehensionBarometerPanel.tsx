import { AlertTriangle, Clock3, Gauge, ThumbsUp, Users } from "lucide-react";
import type { ComprehensionSignalEntry, ComprehensionSignalStatus } from "../../api/comprehensionSignals";
import { Badge } from "../ui/badge";
import { Button } from "../ui/Button";

interface ComprehensionBarometerPanelProps {
  signals: ComprehensionSignalEntry[];
  currentSignal?: ComprehensionSignalEntry | null;
  onSignal: (status: ComprehensionSignalStatus) => Promise<void> | void;
  saving?: boolean;
  isTeacherView: boolean;
  onlineLearnerCount: number;
  currentVideoTitle?: string;
  theme?: "light" | "dark";
  formatTimeLabel: (seconds: number) => string;
}

const STATUS_META: Record<
  ComprehensionSignalStatus,
  {
    label: string;
    shortLabel: string;
    description: string;
    tone: string;
    icon: typeof ThumbsUp;
  }
> = {
  understood: {
    label: "Je suis",
    shortLabel: "Ca va",
    description: "Je suis le rythme, on peut continuer.",
    tone: "bg-emerald-600 hover:bg-emerald-700 text-white",
    icon: ThumbsUp,
  },
  slow_down: {
    label: "Ralentir",
    shortLabel: "Ralentir",
    description: "Le cours va un peu trop vite pour moi.",
    tone: "bg-amber-500 hover:bg-amber-600 text-black",
    icon: Clock3,
  },
  lost: {
    label: "Je suis perdu",
    shortLabel: "Perdus",
    description: "Je n'ai pas compris ce passage, il faut revenir dessus.",
    tone: "bg-red-600 hover:bg-red-700 text-white",
    icon: AlertTriangle,
  },
};

function formatClock(rawDate: string) {
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return rawDate;
  }

  return parsed.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ComprehensionBarometerPanel({
  signals,
  currentSignal,
  onSignal,
  saving = false,
  isTeacherView,
  onlineLearnerCount,
  currentVideoTitle,
  theme = "dark",
  formatTimeLabel,
}: ComprehensionBarometerPanelProps) {
  const counts = {
    understood: signals.filter((signal) => signal.status === "understood").length,
    slow_down: signals.filter((signal) => signal.status === "slow_down").length,
    lost: signals.filter((signal) => signal.status === "lost").length,
  };
  const responseCount = signals.length;
  const responseRate =
    onlineLearnerCount > 0 ? Math.min(100, Math.round((responseCount / onlineLearnerCount) * 100)) : 0;
  const latestSignals = [...signals]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  const summaryTone =
    counts.lost >= Math.max(2, counts.understood)
      ? theme === "dark"
        ? "border-red-900/40 bg-red-950/20 text-red-100"
        : "border-red-200 bg-red-50 text-red-700"
      : counts.slow_down > 0
        ? theme === "dark"
          ? "border-amber-900/40 bg-amber-950/20 text-amber-100"
          : "border-amber-200 bg-amber-50 text-amber-700"
        : theme === "dark"
          ? "border-emerald-900/40 bg-emerald-950/20 text-emerald-100"
          : "border-emerald-200 bg-emerald-50 text-emerald-700";

  const summaryText =
    responseCount === 0
      ? "Aucun signal pour l'instant."
      : counts.lost >= Math.max(2, counts.understood)
        ? "Plusieurs etudiants sont perdus sur ce passage."
        : counts.slow_down > 0
          ? "Le rythme semble un peu rapide pour une partie de la salle."
          : "La majorite suit bien l'explication.";

  return (
    <div className={`flex h-full flex-col ${theme === "dark" ? "bg-zinc-900" : "bg-gray-100"}`}>
      <div className={`border-b px-4 py-4 ${theme === "dark" ? "border-zinc-800" : "border-gray-300"}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                theme === "dark" ? "bg-red-600/10 text-red-400" : "bg-red-100 text-red-700"
              }`}
            >
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h3 className={theme === "dark" ? "text-white" : "text-black"}>Barometre live</h3>
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {isTeacherView
                  ? "Vue prof du ressenti des etudiants connectes"
                  : "Indique en direct si tu suis bien le cours"}
              </p>
            </div>
          </div>

          <Badge className={theme === "dark" ? "bg-zinc-800 text-gray-200" : "bg-white text-gray-700"}>
            <Users className="mr-1 h-3 w-3" />
            {onlineLearnerCount} eleve{onlineLearnerCount > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isTeacherView ? (
          <div className="space-y-4">
            <div className={`rounded-2xl border px-4 py-4 ${summaryTone}`}>
              <p className="text-sm font-medium">{summaryText}</p>
              <p className="mt-1 text-xs opacity-80">
                {responseCount} signal{responseCount > 1 ? "s" : ""} actif{responseCount > 1 ? "s" : ""} • taux
                de retour {responseRate}%
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(["understood", "slow_down", "lost"] as ComprehensionSignalStatus[]).map((status) => {
                const meta = STATUS_META[status];
                const Icon = meta.icon;
                const count = counts[status];
                const percent = responseCount > 0 ? Math.round((count / responseCount) * 100) : 0;
                return (
                  <div
                    key={status}
                    className={`rounded-2xl border p-4 ${
                      theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${meta.tone}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={theme === "dark" ? "text-white" : "text-black"}>{meta.shortLabel}</p>
                          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {meta.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-2xl font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                          {count}
                        </p>
                        <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                          {percent}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={`rounded-2xl border p-4 ${
                theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={theme === "dark" ? "text-white" : "text-black"}>Derniers retours</p>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Clique sur un eleve perdu, puis reviens au passage indique si besoin.
                  </p>
                </div>
                {currentVideoTitle && (
                  <Badge className={theme === "dark" ? "bg-zinc-800 text-gray-200" : "bg-gray-100 text-gray-700"}>
                    {currentVideoTitle}
                  </Badge>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {latestSignals.length === 0 ? (
                  <div
                    className={`rounded-xl border border-dashed px-4 py-6 text-sm ${
                      theme === "dark"
                        ? "border-zinc-800 text-gray-500"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    Aucun etudiant n'a encore signale son ressenti.
                  </div>
                ) : (
                  latestSignals.map((signal) => {
                    const meta = STATUS_META[signal.status];
                    const Icon = meta.icon;
                    return (
                      <div
                        key={signal.id}
                        className={`rounded-xl border px-4 py-3 ${
                          theme === "dark" ? "border-zinc-800 bg-zinc-900/70" : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${meta.tone}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className={theme === "dark" ? "text-white" : "text-black"}>
                                {signal.userName}
                              </p>
                              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                {meta.label} • {formatClock(signal.updatedAt)}
                              </p>
                            </div>
                          </div>

                          <Badge className={meta.tone}>{formatTimeLabel(signal.videoTime)}</Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className={`rounded-2xl border p-4 ${
                theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-gray-200 bg-white"
              }`}
            >
              <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>
                Comment tu vis l'explication en ce moment ?
              </p>
              <p className={`mt-1 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Ton signal aide le prof a ajuster le rythme sans passer par le chat.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3">
                {(["understood", "slow_down", "lost"] as ComprehensionSignalStatus[]).map((status) => {
                  const meta = STATUS_META[status];
                  const Icon = meta.icon;
                  const active = currentSignal?.status === status;
                  return (
                    <Button
                      key={status}
                      type="button"
                      onClick={() => void onSignal(status)}
                      disabled={saving}
                      className={`h-auto min-h-16 justify-start rounded-2xl px-4 py-4 text-left ${
                        active ? meta.tone : theme === "dark" ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-white text-black hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${active ? "bg-black/15" : theme === "dark" ? "bg-zinc-800" : "bg-gray-100"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p>{meta.label}</p>
                          <p className={`mt-1 text-xs ${active ? "opacity-80" : theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {meta.description}
                          </p>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div
              className={`rounded-2xl border p-4 ${
                theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={theme === "dark" ? "text-white" : "text-black"}>Ton dernier signal</p>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Le prof voit ce retour en direct.
                  </p>
                </div>
                {currentSignal && <Badge className={STATUS_META[currentSignal.status].tone}>{STATUS_META[currentSignal.status].label}</Badge>}
              </div>

              {currentSignal ? (
                <div className={`mt-4 rounded-xl border px-4 py-3 ${
                  theme === "dark" ? "border-zinc-800 bg-zinc-900/70" : "border-gray-200 bg-gray-50"
                }`}>
                  <p className={`text-sm ${theme === "dark" ? "text-white" : "text-black"}`}>
                    Enregistre a {formatTimeLabel(currentSignal.videoTime)} • {formatClock(currentSignal.updatedAt)}
                  </p>
                  {currentVideoTitle && (
                    <p className={`mt-1 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Video en cours: {currentVideoTitle}
                    </p>
                  )}
                </div>
              ) : (
                <div className={`mt-4 rounded-xl border border-dashed px-4 py-6 text-sm ${
                  theme === "dark" ? "border-zinc-800 text-gray-500" : "border-gray-200 text-gray-500"
                }`}>
                  Aucun signal envoye pour le moment.
                </div>
              )}
            </div>

            <div
              className={`rounded-2xl border p-4 ${
                theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className={theme === "dark" ? "text-white" : "text-black"}>Tendance globale</p>
                <Badge className={theme === "dark" ? "bg-zinc-800 text-gray-200" : "bg-gray-100 text-gray-700"}>
                  {responseCount} retour{responseCount > 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="mt-4 space-y-3">
                {(["understood", "slow_down", "lost"] as ComprehensionSignalStatus[]).map((status) => {
                  const meta = STATUS_META[status];
                  const count = counts[status];
                  const width = responseCount > 0 ? Math.max(8, Math.round((count / responseCount) * 100)) : 0;
                  return (
                    <div key={status}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>{meta.shortLabel}</span>
                        <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>{count}</span>
                      </div>
                      <div className={`h-2 rounded-full ${theme === "dark" ? "bg-zinc-800" : "bg-gray-200"}`}>
                        <div
                          className={`h-2 rounded-full ${status === "understood" ? "bg-emerald-500" : status === "slow_down" ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
