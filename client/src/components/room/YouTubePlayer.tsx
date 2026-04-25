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
  canControl?: boolean;
  syncTime?: number;
  syncNonce?: number;
  onTimeUpdate?: (seconds: number) => void;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  onEnded?: () => void;
  theme?: "light" | "dark";
  muted?: boolean;
  label?: string;
  showPlayButton?: boolean;
  showBadge?: boolean;
}

export function YouTubePlayer({
  videoId,
  isPlaying,
  onPlayPause,
  canControl = true,
  syncTime,
  syncNonce,
  onTimeUpdate,
  onPlaybackStateChange,
  onEnded,
  theme = "dark",
  muted = false,
  label = "En direct",
  showPlayButton = true,
  showBadge = true
}: YouTubePlayerProps) {
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tickIntervalRef = useRef<number | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onPlaybackStateChangeRef = useRef(onPlaybackStateChange);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    onPlaybackStateChangeRef.current = onPlaybackStateChange;
  }, [onPlaybackStateChange]);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

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
            autoplay: isPlaying ? 1 : 0,
            controls: showPlayButton ? 1 : 0,
            mute: muted ? 1 : 0,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (event: any) => {
              // Always keep the concrete YT player instance from the ready event.
              if (event?.target) {
                playerRef.current = event.target;
              }
              setPlayerReady(true);
              if (muted && typeof event?.target?.mute === "function") {
                event.target.mute();
              }
              if (
                typeof syncTime === "number" &&
                syncTime > 0 &&
                typeof playerRef.current?.seekTo === "function"
              ) {
                playerRef.current.seekTo(syncTime, true);
              }
            },
            onStateChange: (event: any) => {
              const yt = (window as any).YT;
              if (!yt) return;

              if (event.data === yt.PlayerState.PLAYING) {
                onPlaybackStateChangeRef.current?.(true);
                if (tickIntervalRef.current) {
                  window.clearInterval(tickIntervalRef.current);
                }
                tickIntervalRef.current = window.setInterval(() => {
                  if (!playerRef.current?.getCurrentTime) return;
                  const t = Number(playerRef.current.getCurrentTime().toFixed(2));
                  onTimeUpdateRef.current?.(t);
                }, 1000);
              } else if (event.data === yt.PlayerState.BUFFERING) {
                // Seek from scrub often goes through BUFFERING first.
                if (playerRef.current?.getCurrentTime) {
                  const t = Number(playerRef.current.getCurrentTime().toFixed(2));
                  onTimeUpdateRef.current?.(t);
                }
              } else if (event.data === yt.PlayerState.ENDED) {
                onPlaybackStateChangeRef.current?.(false);
                onEndedRef.current?.();
                if (playerRef.current?.getCurrentTime) {
                  const t = Number(playerRef.current.getCurrentTime().toFixed(2));
                  onTimeUpdateRef.current?.(t);
                }
                if (tickIntervalRef.current) {
                  window.clearInterval(tickIntervalRef.current);
                  tickIntervalRef.current = null;
                }
              } else if (event.data === yt.PlayerState.PAUSED) {
                onPlaybackStateChangeRef.current?.(false);
                if (playerRef.current?.getCurrentTime) {
                  const t = Number(playerRef.current.getCurrentTime().toFixed(2));
                  onTimeUpdateRef.current?.(t);
                }
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
    if (!playerReady || !playerRef.current) return;

    if (muted && typeof playerRef.current.mute === "function") {
      playerRef.current.mute();
    } else if (!muted && typeof playerRef.current.unMute === "function") {
      playerRef.current.unMute();
    }
  }, [muted, playerReady]);

  useEffect(() => {
    if (playerReady && playerRef.current) {
      const canPlay = typeof playerRef.current.playVideo === "function";
      const canPause = typeof playerRef.current.pauseVideo === "function";
      if (isPlaying && canPlay) {
        if (muted && typeof playerRef.current.mute === "function") {
          playerRef.current.mute();
        }
        playerRef.current.playVideo();
      } else if (!isPlaying && canPause) {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, muted, playerReady]);

  useEffect(() => {
    if (
      !playerReady ||
      !playerRef.current ||
      typeof syncTime !== "number" ||
      typeof playerRef.current.seekTo !== "function"
    ) return;
    playerRef.current.seekTo(Math.max(0, syncTime), true);
  }, [syncNonce, syncTime, playerReady]);

  return (
    <div className={`relative ${theme === 'dark' ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-200 to-gray-300'} rounded-xl overflow-hidden`}>
      {showBadge && (
        <Badge className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1 z-10">
          {label}
        </Badge>
      )}
      
      <div className="relative w-full aspect-video">
        <div ref={containerRef} className="w-full h-full" />
        {!canControl && <div className="absolute inset-0 z-10" />}
      </div>
      
      {/* Contrôle overlay (optionnel) */}
      {showPlayButton && (
        <div className="absolute bottom-4 right-4 z-10">
        <button 
          onClick={onPlayPause}
          disabled={!canControl}
          className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-0.5" />
          )}
        </button>
        </div>
      )}
    </div>
  );
}
