import { useMemo } from "react";
import { X, Clock, ThumbsUp, Play, Trophy } from "lucide-react";
import { Button } from "../ui/Button";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  votes: number;
}

interface LiveVideoVotePoll {
  pollId: string;
  startedAt: number;
  endsAt: number | null;
  isActive: boolean;
  startedBy: string;
  votes: Record<string, number>;
  voterChoices: Record<string, string>;
  winnerVideoId?: string | null;
}

export interface VideoVotePanelProps {
  videos: Video[];
  poll: LiveVideoVotePoll | null;
  remainingSeconds: number;
  canManagePoll: boolean;
  canVote: boolean;
  currentUserVoteKey: string;
  onStartPoll: () => void;
  onClose: () => void;
  onVote: (videoId: string) => void;
  theme?: "light" | "dark";
}

export function VideoVotePanel({
  onClose,
  videos,
  poll,
  remainingSeconds,
  canManagePoll,
  canVote,
  currentUserVoteKey,
  onStartPoll,
  onVote,
}: VideoVotePanelProps) {
  const formatRemaining = (seconds: number) => {
    const safe = Math.max(0, seconds);
    const min = Math.floor(safe / 60);
    const sec = safe % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const activePoll = poll?.isActive ? poll : null;
  const availableVideos = useMemo(() => {
    if (!poll?.votes) return videos;
    const ids = new Set(Object.keys(poll.votes));
    const filtered = videos.filter((video) => ids.has(video.id));
    return filtered.length > 0 ? filtered : videos;
  }, [videos, poll]);

  const userVotedVideoId = poll?.voterChoices?.[currentUserVoteKey] || null;
  const totalVotes = useMemo(() => {
    if (!poll?.votes) return 0;
    return Object.values(poll.votes).reduce((sum, v) => sum + v, 0);
  }, [poll]);

  const topVideoId = useMemo(() => {
    if (!poll?.votes) return null;
    let bestId: string | null = null;
    let bestCount = -1;
    for (const video of availableVideos) {
      const count = poll.votes[video.id] || 0;
      if (count > bestCount) {
        bestCount = count;
        bestId = video.id;
      }
    }
    return bestCount >= 0 ? bestId : null;
  }, [availableVideos, poll]);

  const winnerVideo = poll?.winnerVideoId
    ? availableVideos.find((video) => video.id === poll.winnerVideoId) || null
    : null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-xl border border-zinc-800 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-xl">Vote vidéo en temps réel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activePoll ? (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-600/15 border border-red-500/30 px-3 py-2">
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <Clock className="w-4 h-4" />
              <span>Temps restant: <strong>{formatRemaining(remainingSeconds)}</strong></span>
            </div>
            <span className="text-xs text-gray-300">1 vote par personne</span>
          </div>
        ) : (
          <div className="mb-4 rounded-lg bg-zinc-800/80 border border-zinc-700 px-3 py-2 text-sm text-gray-300">
            {winnerVideo ? (
              <span className="flex items-center gap-2 text-green-400">
                <Trophy className="w-4 h-4" />
                Dernière gagnante: {winnerVideo.title}
              </span>
            ) : (
              <span>La régie peut lancer un vote de 5 minutes.</span>
            )}
          </div>
        )}

        <div className="space-y-3 overflow-y-auto flex-1 mb-4">
          {availableVideos.length === 0 && (
            <p className="text-sm text-gray-400">Aucune vidéo disponible pour ce vote.</p>
          )}

          {availableVideos.map((video) => {
            const votes = poll?.votes?.[video.id] || 0;
            const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const isUserChoice = userVotedVideoId === video.id;
            const isLeading = topVideoId === video.id;
            const canClickVote = Boolean(activePoll) && !userVotedVideoId && canVote;

            return (
              <button
                key={video.id}
                onClick={() => canClickVote && onVote(video.id)}
                disabled={!canClickVote}
                className={`w-full text-left rounded-lg border p-3 transition-all ${
                  isUserChoice
                    ? "border-red-500 bg-red-500/15"
                    : isLeading
                    ? "border-green-500/50 bg-green-500/10"
                    : "border-zinc-700 bg-zinc-800/60"
                } ${canClickVote ? "hover:border-red-400" : "cursor-default"}`}
              >
                <div className="flex gap-3">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-24 h-14 rounded object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm whitespace-normal break-words leading-snug">{video.title}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs">
                      <span className="text-gray-300 flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {votes} vote{votes > 1 ? "s" : ""}
                      </span>
                      {isLeading && totalVotes > 0 && (
                        <span className="text-green-400">En tête</span>
                      )}
                      {isUserChoice && (
                        <span className="text-red-300">Votre vote</span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-zinc-700 rounded mt-2 overflow-hidden">
                      <div
                        className="h-1.5 bg-red-500 rounded"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {!activePoll && canManagePoll && (
            <Button
              onClick={onStartPoll}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Lancer le vote (5 min)
            </Button>
          )}

          {!activePoll && !canManagePoll && (
            <div className="flex-1 text-center text-sm text-gray-400 py-2">
              En attente du lancement par la régie.
            </div>
          )}

          {activePoll && userVotedVideoId && (
            <div className="flex-1 text-center text-sm text-green-400 py-2">
              Vote enregistré. Résultat automatique à la fin du timer.
            </div>
          )}

          {activePoll && !userVotedVideoId && !canVote && (
            <div className="flex-1 text-center text-sm text-gray-400 py-2">
              Les sondages sont désactivés pour votre compte.
            </div>
          )}

          {activePoll && !userVotedVideoId && canVote && (
            <div className="flex-1 text-center text-sm text-gray-300 py-2">
              Cliquez sur une vidéo pour voter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
