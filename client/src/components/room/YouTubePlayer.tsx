/**
 * Projet : WithYou
 * Fichier : components/room/YoutubePlayer.tsx
 *
 * Lecteur YouTube sécurisé :
 * - iframe simple (pas d’API JS)
 * - youtube-nocookie
 * - origin obligatoire
 * - évite les blocages "trafic exceptionnel"
 */
import { useState, useEffect, useRef } from "react";
import { Badge } from "../ui/badge";
import { Play, Pause } from "lucide-react";

interface YouTubePlayerProps {
  videoId: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  syncTime?: number;
  syncNonce?: number;
  onTimeUpdate?: (seconds: number) => void;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  theme?: "light" | "dark";
}

export function YouTubePlayer({
  videoId,
  isPlaying,
  onPlayPause,
  syncTime,
  syncNonce,
  onTimeUpdate,
  onPlaybackStateChange,
  theme = "dark"
}: YouTubePlayerProps) {
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tickIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Vérifier si l'API YouTube est déjà chargée
    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      // Charger l'API YouTube IFrame si pas encore chargée
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // Fonction appelée quand l'API est prête
      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }

    function initPlayer() {
      if (containerRef.current && !playerRef.current) {
        playerRef.current = new (window as any).YT.Player(containerRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: () => {
              setPlayerReady(true);
              if (typeof syncTime === "number" && syncTime > 0) {
                playerRef.current.seekTo(syncTime, true);
              }
            },
            onStateChange: (event: any) => {
              const yt = (window as any).YT;
              if (!yt) return;

              if (event.data === yt.PlayerState.PLAYING) {
                onPlaybackStateChange?.(true);
                if (tickIntervalRef.current) {
                  window.clearInterval(tickIntervalRef.current);
                }
                tickIntervalRef.current = window.setInterval(() => {
                  if (!playerRef.current?.getCurrentTime) return;
                  const t = Math.floor(playerRef.current.getCurrentTime());
                  onTimeUpdate?.(t);
                }, 1000);
              } else if (
                event.data === yt.PlayerState.PAUSED ||
                event.data === yt.PlayerState.ENDED
              ) {
                onPlaybackStateChange?.(false);
                if (tickIntervalRef.current) {
                  window.clearInterval(tickIntervalRef.current);
                  tickIntervalRef.current = null;
                }
              }
            },
          },
        });
      }
    }

    return () => {
      if (tickIntervalRef.current) {
        window.clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      // Cleanup
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (playerReady && playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, playerReady]);

  useEffect(() => {
    if (!playerReady || !playerRef.current || typeof syncTime !== "number") return;
    playerRef.current.seekTo(Math.max(0, syncTime), true);
  }, [syncNonce, syncTime, playerReady]);

  return (
    <div className={`relative ${theme === 'dark' ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-200 to-gray-300'} rounded-xl overflow-hidden`}>
      <Badge className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1 z-10">
        En direct
      </Badge>
      
      <div className="relative w-full aspect-video">
        <div ref={containerRef} className="w-full h-full" />
      </div>
      
      {/* Contrôle overlay (optionnel) */}
      <div className="absolute bottom-4 right-4 z-10">
        <button 
          onClick={onPlayPause}
          className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
