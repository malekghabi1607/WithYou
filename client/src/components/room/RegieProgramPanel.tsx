import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock3,
  List,
  Megaphone,
  Pause,
  Play,
  Plus,
  Square,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { Button } from "../ui/Button";

export type RegieProgramStep =
  | { id: string; type: "announcement"; message: string }
  | { id: string; type: "countdown"; seconds: number }
  | { id: string; type: "video"; videoId: string };

export type RegieProgramStepDraft =
  | { type: "announcement"; message: string }
  | { type: "countdown"; seconds: number }
  | { type: "video"; videoId: string };

interface ProgramPlaylistItem {
  id: string;
  title: string;
}

interface RegieProgramPanelProps {
  isOpen: boolean;
  steps: RegieProgramStep[];
  playlist: ProgramPlaylistItem[];
  status: "idle" | "running" | "paused";
  currentStepIndex: number | null;
  waitingForVideoEnd: boolean;
  onAddStep: (step: RegieProgramStepDraft) => void;
  onRemoveStep: (stepId: string) => void;
  onMoveStep: (stepId: string, direction: "up" | "down") => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onClose: () => void;
  theme?: "light" | "dark";
}

const COUNTDOWN_PRESETS = [3, 5, 10];

const getStepIcon = (type: RegieProgramStep["type"]) => {
  switch (type) {
    case "announcement":
      return Megaphone;
    case "countdown":
      return Clock3;
    case "video":
      return Video;
    default:
      return List;
  }
};

export function RegieProgramPanel({
  isOpen,
  steps,
  playlist,
  status,
  currentStepIndex,
  waitingForVideoEnd,
  onAddStep,
  onRemoveStep,
  onMoveStep,
  onStart,
  onPause,
  onResume,
  onStop,
  onClose,
  theme = "dark",
}: RegieProgramPanelProps) {
  const [draftType, setDraftType] = useState<RegieProgramStep["type"]>("announcement");
  const [announcementText, setAnnouncementText] = useState("");
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  const [selectedVideoId, setSelectedVideoId] = useState("");

  const dark = theme === "dark";
  const isLocked = status !== "idle";

  useEffect(() => {
    if (!selectedVideoId && playlist[0]?.id) {
      setSelectedVideoId(playlist[0].id);
    }
  }, [playlist, selectedVideoId]);

  useEffect(() => {
    if (!isOpen) {
      setDraftType("announcement");
      setAnnouncementText("");
      setCountdownSeconds(3);
      setSelectedVideoId((current) => current || playlist[0]?.id || "");
    }
  }, [isOpen, playlist]);

  const statusLabel = useMemo(() => {
    if (status === "running") {
      if (waitingForVideoEnd) {
        return "En attente de la fin de la video";
      }
      if (currentStepIndex !== null) {
        return `En cours - etape ${currentStepIndex + 1}/${steps.length}`;
      }
      return "En cours";
    }

    if (status === "paused") {
      return "Programme en pause";
    }

    return "Programme pret";
  }, [currentStepIndex, status, steps.length, waitingForVideoEnd]);

  const getVideoTitle = (videoId: string) =>
    playlist.find((video) => video.id === videoId)?.title || "Video introuvable";

  const getStepSummary = (step: RegieProgramStep) => {
    switch (step.type) {
      case "announcement":
        return step.message;
      case "countdown":
        return `${step.seconds}s`;
      case "video":
        return getVideoTitle(step.videoId);
      default:
        return "";
    }
  };

  const handleAddStep = () => {
    if (draftType === "announcement") {
      const message = announcementText.trim();
      if (!message) return;
      onAddStep({ type: "announcement", message });
      setAnnouncementText("");
      return;
    }

    if (draftType === "countdown") {
      onAddStep({ type: "countdown", seconds: Math.max(1, countdownSeconds) });
      return;
    }

    if (!selectedVideoId) return;
    onAddStep({ type: "video", videoId: selectedVideoId });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10040] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-4xl overflow-hidden rounded-3xl border shadow-2xl ${
          dark ? "border-zinc-800 bg-zinc-950" : "border-gray-200 bg-white"
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-red-600/15 via-orange-500/10 to-amber-300/10" />

        <div
          className={`relative flex items-center justify-between border-b px-6 py-5 ${
            dark ? "border-zinc-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/15">
              <List className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className={dark ? "text-white" : "text-black"}>Programme regie</h2>
              <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
                Prepare le deroulement de la seance et lance les etapes automatiquement
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              dark
                ? "text-gray-400 hover:bg-zinc-800 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-black"
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div
              className={`rounded-2xl border p-4 ${
                dark ? "border-zinc-800 bg-zinc-900/80" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-xs uppercase tracking-[0.18em] ${dark ? "text-gray-500" : "text-gray-500"}`}>
                    Statut
                  </p>
                  <p className={`mt-2 text-base font-semibold ${dark ? "text-white" : "text-black"}`}>
                    {statusLabel}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {status === "idle" && (
                    <Button
                      type="button"
                      onClick={onStart}
                      disabled={steps.length === 0}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Play className="h-4 w-4" />
                      Lancer
                    </Button>
                  )}

                  {status === "running" && (
                    <>
                      <Button
                        type="button"
                        onClick={onPause}
                        variant="ghost"
                        className={dark ? "text-white hover:bg-zinc-800" : "text-black hover:bg-gray-100"}
                      >
                        <Pause className="h-4 w-4" />
                        Pause
                      </Button>
                      <Button type="button" onClick={onStop} className="bg-red-600 hover:bg-red-700 text-white">
                        <Square className="h-4 w-4" />
                        Arreter
                      </Button>
                    </>
                  )}

                  {status === "paused" && (
                    <>
                      <Button type="button" onClick={onResume} className="bg-red-600 hover:bg-red-700 text-white">
                        <Play className="h-4 w-4" />
                        Reprendre
                      </Button>
                      <Button
                        type="button"
                        onClick={onStop}
                        variant="ghost"
                        className={dark ? "text-white hover:bg-zinc-800" : "text-black hover:bg-gray-100"}
                      >
                        <Square className="h-4 w-4" />
                        Arreter
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <p className={`mt-3 text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
                Une etape video attend la fin de la video avant de passer a la suite.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-4 ${
                dark ? "border-zinc-800 bg-zinc-900/80" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value as RegieProgramStep["type"])}
                  disabled={isLocked}
                  className={`h-10 rounded-xl border px-3 text-sm outline-none ${
                    dark ? "border-zinc-700 bg-zinc-950 text-white" : "border-gray-300 bg-white text-black"
                  }`}
                >
                  <option value="announcement">Annonce</option>
                  <option value="countdown">Compte a rebours</option>
                  <option value="video">Video</option>
                </select>

                {draftType === "announcement" && (
                  <input
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value.slice(0, 140))}
                    disabled={isLocked}
                    placeholder="Ex: La seance commence dans quelques secondes"
                    className={`h-10 flex-1 rounded-xl border px-3 text-sm outline-none ${
                      dark
                        ? "border-zinc-700 bg-zinc-950 text-white placeholder:text-gray-500"
                        : "border-gray-300 bg-white text-black placeholder:text-gray-400"
                    }`}
                  />
                )}

                {draftType === "countdown" && (
                  <div className="flex flex-wrap items-center gap-2">
                    {COUNTDOWN_PRESETS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        disabled={isLocked}
                        onClick={() => setCountdownSeconds(value)}
                        className={`rounded-xl border px-3 py-2 text-sm transition ${
                          countdownSeconds === value
                            ? "border-red-500 bg-red-600 text-white"
                            : dark
                              ? "border-zinc-700 bg-zinc-950 text-gray-300"
                              : "border-gray-300 bg-white text-gray-700"
                        }`}
                      >
                        {value}s
                      </button>
                    ))}
                  </div>
                )}

                {draftType === "video" && (
                  <select
                    value={selectedVideoId}
                    onChange={(e) => setSelectedVideoId(e.target.value)}
                    disabled={isLocked || playlist.length === 0}
                    className={`h-10 min-w-[16rem] flex-1 rounded-xl border px-3 text-sm outline-none ${
                      dark ? "border-zinc-700 bg-zinc-950 text-white" : "border-gray-300 bg-white text-black"
                    }`}
                  >
                    {playlist.length === 0 ? (
                      <option value="">Aucune video disponible</option>
                    ) : (
                      playlist.map((video) => (
                        <option key={video.id} value={video.id}>
                          {video.title}
                        </option>
                      ))
                    )}
                  </select>
                )}

                <Button
                  type="button"
                  onClick={handleAddStep}
                  disabled={
                    isLocked ||
                    (draftType === "announcement" && !announcementText.trim()) ||
                    (draftType === "video" && !selectedVideoId)
                  }
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {steps.length === 0 ? (
                <div
                  className={`rounded-2xl border p-6 text-center ${
                    dark ? "border-zinc-800 bg-zinc-900/50 text-gray-400" : "border-gray-200 bg-gray-50 text-gray-600"
                  }`}
                >
                  <List className="mx-auto mb-3 h-8 w-8 opacity-50" />
                  <p className="text-sm">Aucune etape pour le moment.</p>
                  <p className="mt-1 text-xs">Ajoute une annonce, un compte a rebours ou une video.</p>
                </div>
              ) : (
                steps.map((step, index) => {
                  const Icon = getStepIcon(step.type);
                  const active = currentStepIndex === index;

                  return (
                    <div
                      key={step.id}
                      className={`rounded-2xl border p-4 transition ${
                        active
                          ? "border-red-500 bg-red-600/10"
                          : dark
                            ? "border-zinc-800 bg-zinc-900/50"
                            : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              active
                                ? "bg-red-600 text-white"
                                : dark
                                  ? "bg-zinc-800 text-gray-300"
                                  : "bg-white text-gray-700"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className={`text-sm font-semibold ${dark ? "text-white" : "text-black"}`}>
                              Etape {index + 1}
                              <span className={`ml-2 text-xs font-normal ${dark ? "text-gray-400" : "text-gray-600"}`}>
                                {step.type === "announcement"
                                  ? "Annonce"
                                  : step.type === "countdown"
                                    ? "Compte a rebours"
                                    : "Video"}
                              </span>
                            </p>
                            <p className={`mt-1 text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>
                              {getStepSummary(step)}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => onMoveStep(step.id, "up")}
                            disabled={isLocked || index === 0}
                            className={dark ? "text-gray-300 hover:text-white hover:bg-zinc-800" : "text-gray-700 hover:text-black hover:bg-gray-100"}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => onMoveStep(step.id, "down")}
                            disabled={isLocked || index === steps.length - 1}
                            className={dark ? "text-gray-300 hover:text-white hover:bg-zinc-800" : "text-gray-700 hover:text-black hover:bg-gray-100"}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => onRemoveStep(step.id)}
                            disabled={isLocked}
                            className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div
              className={`rounded-2xl border p-4 ${
                dark ? "border-zinc-800 bg-zinc-900/80" : "border-gray-200 bg-gray-50"
              }`}
            >
              <p className={`text-xs uppercase tracking-[0.18em] ${dark ? "text-gray-500" : "text-gray-500"}`}>
                Exemple d'usage
              </p>
              <div className={`mt-4 space-y-3 text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>
                <p>1. Annonce : "La seance commence"</p>
                <p>2. Compte a rebours : 3 secondes</p>
                <p>3. Video : Video 1</p>
                <p>4. Annonce : "Pause rapide"</p>
                <p>5. Video : Video 2</p>
              </div>
            </div>

            <div
              className={`rounded-2xl border p-4 ${
                dark ? "border-zinc-800 bg-zinc-900/80" : "border-gray-200 bg-gray-50"
              }`}
            >
              <p className={`text-xs uppercase tracking-[0.18em] ${dark ? "text-gray-500" : "text-gray-500"}`}>
                Comportement
              </p>
              <div className={`mt-4 space-y-2 text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>
                <p>Les annonces sont diffusees a tous les participants.</p>
                <p>Le compte a rebours est partage avec tous les participants.</p>
                <p>Une video attend sa fin avant de passer a l'etape suivante.</p>
                <p>Pendant l'execution, l'edition des etapes est verrouillee.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
