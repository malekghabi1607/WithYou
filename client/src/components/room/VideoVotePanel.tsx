/**
 * Projet : WithYou
 * Fichier : components/room/VideoVotePanel.tsx
 *
 * Description :
 * Composant modal permettant aux utilisateurs de voter pour la
 * prochaine vidéo à lancer dans un salon.
 *
 * Fonctionnalités :
 * - Affiche la liste des vidéos disponibles avec leur nombre de votes
 * - Permet à l’utilisateur de sélectionner une seule vidéo
 * - Enregistre le vote avec une limite d’un vote toutes les 24 heures
 * - Empêche le revote avant la fin du délai
 * - Met en évidence la vidéo actuellement en tête des votes
 *
 * UX / UI :
 * - Interface modale avec fond sombre et flou
 * - Feedback visuel sur la sélection et l’état du vote
 * - Notifications utilisateur via Sonner (succès / erreur)
 * - Fermeture automatique après validation du vote
 *
 * Objectif :
 * Favoriser une décision collective et équitable pour choisir
 * la prochaine vidéo à regarder dans le salon.
 */

import { X, ThumbsUp, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { hasVotedForVideo, recordVideoVote, getTimeUntilNextVote, formatTimeUntilNextVote } from "../../utils/voteStorage";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  votes: number;
}

export interface VideoVotePanelProps {
  videos: Video[];
  onClose: () => void;
  onVote: (videoId: string) => void;
  theme?: "light" | "dark";
}

export function VideoVotePanel({ onClose, videos }: VideoVotePanelProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoVotes, setVideoVotes] = useState<Map<string, number>>(
    new Map(videos.map(v => [v.id, v.votes || 0]))
  );
  const [votedVideoId, setVotedVideoId] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà voté pour une des vidéos
    for (const video of videos) {
      if (hasVotedForVideo(video.id)) {
        setVotedVideoId(video.id);
        break;
      }
    }
  }, [videos]);

  const handleVote = (videoId: string) => {
    if (votedVideoId) {
      const hoursRemaining = getTimeUntilNextVote("video", votedVideoId);
      toast.error(`Vous avez déjà voté ! ${formatTimeUntilNextVote(hoursRemaining)}`);
      return;
    }
    setSelectedVideo(videoId);
  };

  const handleConfirmVote = () => {
    if (!selectedVideo) {
      toast.error("Veuillez sélectionner une vidéo");
      return;
    }

    // Enregistrer le vote avec la limite de 24h
    const success = recordVideoVote(selectedVideo);
    if (!success) {
      const hoursRemaining = getTimeUntilNextVote("video", selectedVideo);
      toast.error(`Vous avez déjà voté ! ${formatTimeUntilNextVote(hoursRemaining)}`);
      return;
    }

    setVideoVotes(prev => {
      const newMap = new Map(prev);
      newMap.set(selectedVideo, (newMap.get(selectedVideo) || 0) + 1);
      return newMap;
    });
    
    setVotedVideoId(selectedVideo);
    const videoTitle = videos.find(v => v.id === selectedVideo)?.title;
    toast.success(`Vote enregistré pour : ${videoTitle} ! Prochain vote dans 24h.`);
    
    // Fermer automatiquement après 2 secondes
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl">Votez pour la prochaine vidéo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-gray-400 text-sm mb-6">
          {votedVideoId ? "Merci pour votre vote !" : "Choisissez une seule vidéo"}
        </p>

        {/* Video List */}
        <div className="space-y-3 overflow-y-auto flex-1 mb-6">
          {videos.map((video) => {
            const isSelected = selectedVideo === video.id;
            const currentVotes = videoVotes.get(video.id) || 0;
            const isWinning = currentVotes === Math.max(...Array.from(videoVotes.values()));

            return (
              <button
                key={video.id}
                onClick={() => handleVote(video.id)}
                disabled={Boolean(votedVideoId)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  votedVideoId
                    ? isWinning && currentVotes > 0
                      ? "bg-green-600/20 border-2 border-green-600"
                      : "bg-zinc-800/30 border-2 border-transparent opacity-60"
                    : isSelected
                    ? "bg-red-600/20 border-2 border-red-600"
                    : "bg-zinc-800/50 border-2 border-transparent hover:bg-zinc-800 hover:border-zinc-700"
                } ${votedVideoId ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                {/* Thumbnail */}
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-24 h-14 rounded object-cover shrink-0"
                />

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-white text-sm truncate">{video.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {currentVotes} {currentVotes === 1 ? "vote" : "votes"}
                    </p>
                    {votedVideoId && isWinning && currentVotes > 0 && (
                      <span className="text-green-500 text-xs font-semibold">
                        En tête
                      </span>
                    )}
                  </div>
                </div>

                {/* Vote Indicator */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-red-600 border-2 border-red-400"
                      : "bg-zinc-700 border-2 border-zinc-600"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        {!votedVideoId && (
          <Button
            onClick={handleConfirmVote}
            disabled={!selectedVideo}
            className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-12"
          >
            <ThumbsUp className="w-5 h-5 mr-2" />
            Confirmer mon vote
          </Button>
        )}

        {votedVideoId && (
          <div className="text-center">
            <p className="text-green-500 flex items-center justify-center gap-2">
              <ThumbsUp className="w-5 h-5" />
              Vote enregistré avec succès
            </p>
          </div>
        )}
      </div>
    </div>
  );
}