import { useMemo } from "react";
import { BarChart3, Clock, Play, Sparkles, StopCircle, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface SessionPollOption {
  id: string;
  text: string;
}

interface SessionPollDraftSuggestion {
  question: string;
  options: string[];
  durationSeconds: number;
  source: "manual" | "ai";
}

interface LiveSessionPoll {
  pollId: string;
  question: string;
  options: SessionPollOption[];
  startedAt: number;
  endsAt: number | null;
  isActive: boolean;
  startedBy: string;
  votes: Record<string, number>;
  voterChoices: Record<string, string>;
  source: "manual" | "ai";
}

interface SessionPollPanelProps {
  poll: LiveSessionPoll | null;
  isOpen: boolean;
  canManagePoll: boolean;
  canVote: boolean;
  currentUserVoteKey: string;
  draftQuestion: string;
  draftOptions: string[];
  draftDurationSeconds: number;
  aiSuggestions: SessionPollDraftSuggestion[];
  selectedSuggestionIndex: number | null;
  isGeneratingPoll: boolean;
  onClose: () => void;
  onDraftQuestionChange: (value: string) => void;
  onDraftOptionChange: (index: number, value: string) => void;
  onDraftDurationChange: (value: number) => void;
  onAddDraftOption: () => void;
  onRemoveDraftOption: (index: number) => void;
  onResetDraft: () => void;
  onGenerateAiPoll: () => void;
  onRegenerateAiPoll: () => void;
  onSelectSuggestion: (index: number) => void;
  onLaunchPoll: () => void;
  onFinishPoll: () => void;
  onVote: (optionId: string) => void;
  remainingSeconds: number;
}

const formatRemaining = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const min = Math.floor(safe / 60);
  const sec = safe % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export function SessionPollPanel({
  poll,
  isOpen,
  canManagePoll,
  canVote,
  currentUserVoteKey,
  draftQuestion,
  draftOptions,
  draftDurationSeconds,
  aiSuggestions,
  selectedSuggestionIndex,
  isGeneratingPoll,
  onClose,
  onDraftQuestionChange,
  onDraftOptionChange,
  onDraftDurationChange,
  onAddDraftOption,
  onRemoveDraftOption,
  onResetDraft,
  onGenerateAiPoll,
  onRegenerateAiPoll,
  onSelectSuggestion,
  onLaunchPoll,
  onFinishPoll,
  onVote,
  remainingSeconds,
}: SessionPollPanelProps) {
  if (!isOpen) return null;

  const userChoiceId = poll?.voterChoices?.[currentUserVoteKey] || null;
  const totalVotes = useMemo(() => {
    if (!poll) return 0;
    return Object.values(poll.votes).reduce((sum, count) => sum + count, 0);
  }, [poll]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl text-white">Sondage regie</h2>
            <p className="text-sm text-zinc-400">
              {poll?.isActive ? "Sondage en direct pour toute la session." : "Preparez ou consultez le sondage partage."}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 transition-colors hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {poll?.isActive && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-red-200">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">{poll.question}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-red-200">
                <Clock className="h-4 w-4" />
                <span>{formatRemaining(remainingSeconds)}</span>
              </div>
            </div>

            <div className="space-y-3">
              {poll.options.map((option) => {
                const votes = poll.votes[option.id] || 0;
                const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                const isUserChoice = userChoiceId === option.id;
                const canClickVote = canVote && !userChoiceId;

                return (
                  <button
                    key={option.id}
                    onClick={() => canClickVote && onVote(option.id)}
                    disabled={!canClickVote}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      isUserChoice
                        ? "border-red-400 bg-red-500/15"
                        : "border-zinc-700 bg-zinc-800/80 hover:border-red-500/60"
                    } ${canClickVote ? "" : "cursor-default"}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-white">{option.text}</span>
                      <span className="text-zinc-300">
                        {votes} vote{votes > 1 ? "s" : ""} • {percentage}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-700">
                      <div className="h-2 rounded-full bg-red-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 text-sm text-zinc-300">
              {userChoiceId
                ? "Votre vote est enregistre."
                : canVote
                ? "Vous pouvez voter une seule fois."
                : "Les sondages sont desactives pour votre compte."}
            </div>

            {canManagePoll && (
              <div className="mt-4 flex justify-end">
                <Button onClick={onFinishPoll} className="bg-red-600 hover:bg-red-700 text-white">
                  <StopCircle className="mr-2 h-4 w-4" />
                  Terminer le sondage
                </Button>
              </div>
            )}
          </div>
        )}

        {canManagePoll && (
          <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={onGenerateAiPoll} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
                <Sparkles className="mr-2 h-4 w-4" />
                Generer 3 sondages IA
              </Button>
              {aiSuggestions.length > 0 && (
                <Button
                  variant="outline"
                  onClick={onRegenerateAiPoll}
                  className="border-fuchsia-700 bg-zinc-900 text-fuchsia-200 hover:bg-zinc-800"
                >
                  Regenerer
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onResetDraft}
                className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
              >
                Creer sondage manuel
              </Button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Propositions IA
                </label>
                <div className="grid gap-2 md:grid-cols-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.question}-${index}`}
                      type="button"
                      onClick={() => onSelectSuggestion(index)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        selectedSuggestionIndex === index
                          ? "border-fuchsia-500 bg-fuchsia-500/15"
                          : "border-zinc-700 bg-zinc-900 hover:border-fuchsia-500/50"
                      }`}
                    >
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-fuchsia-300">
                        Sondage {index + 1}
                      </div>
                      <div className="text-sm font-medium text-white">{suggestion.question}</div>
                      <div className="mt-2 text-xs text-zinc-400">
                        {suggestion.options.slice(0, 2).join(" • ")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">Question</label>
              <Input
                value={draftQuestion}
                onChange={(event) => onDraftQuestionChange(event.target.value)}
                placeholder="Ex: Quel est le message principal de ce passage ?"
                className="border-zinc-700 bg-zinc-900 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">Reponses</label>
              <div className="space-y-2">
                {draftOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(event) => onDraftOptionChange(index, event.target.value)}
                      placeholder={`Choix ${index + 1}`}
                      className="border-zinc-700 bg-zinc-900 text-white"
                    />
                    {draftOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onRemoveDraftOption(index)}
                        className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {draftOptions.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onAddDraftOption}
                  className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                >
                  Ajouter une reponse
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">Duree (secondes)</label>
              <Input
                type="number"
                min={15}
                max={600}
                step={15}
                value={draftDurationSeconds}
                onChange={(event) => onDraftDurationChange(Number(event.target.value || 60))}
                className="border-zinc-700 bg-zinc-900 text-white"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                onClick={onLaunchPoll}
                disabled={isGeneratingPoll || Boolean(poll?.isActive)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Lancer le sondage
              </Button>
            </div>

            {isGeneratingPoll && (
              <div className="text-sm text-fuchsia-300">
                Generation des sondages IA en cours...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
