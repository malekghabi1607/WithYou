/**
 * Projet : WithYou
 * Fichier : components/room/YoutubePlayer.tsx
 *
 * Lecteur YouTube securise :
 * - iframe simple (pas d'API JS)
 * - youtube-nocookie
 * - origin obligatoire
 * - evite les blocages "trafic exceptionnel"
 */
import { useState, useEffect, useRef } from "react";
import { Badge } from "../ui/badge";
import { Play, Pause } from "lucide-react";

interface YouTubePlayerProps {
  videoId: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  canControl?: boolean;
  showRegieSeekControls?: boolean;
  disableRegieSeekControls?: boolean;
  onSeekBackward?: () => void;
  onSeekForward?: () => void;
  syncTime?: number;
  syncNonce?: number;
  onTimeUpdate?: (seconds: number) => void;
  onDurationChange?: (seconds: number) => void;
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
  showRegieSeekControls = false,
  disableRegieSeekControls = false,
  onSeekBackward,
  onSeekForward,
  syncTime,
  syncNonce,
  onTimeUpdate,
  onDurationChange,
  onPlaybackStateChange,
  onEnded,
  theme = "dark",
  muted = false,
  label = "En direct",
  showPlayButton = true,
  showBadge = true,
}: YouTubePlayerProps) {
  const [playerReady, setPlayerReady] = useState(false);
  const [showSeekControls, setShowSeekControls] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tickIntervalRef = useRef<number | null>(null);
  const seekControlsTimeoutRef = useRef<number | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onPlaybackStateChangeRef = useRef(onPlaybackStateChange);
  const onDurationChangeRef = useRef(onDurationChange);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    onPlaybackStateChangeRef.current = onPlaybackStateChange;
  }, [onPlaybackStateChange]);

  useEffect(() => {
    onDurationChangeRef.current = onDurationChange;
  }, [onDurationChange]);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  const revealSeekControls = () => {
    if (!showRegieSeekControls) return;
    setShowSeekControls(true);
    if (seekControlsTimeoutRef.current !== null) {
      window.clearTimeout(seekControlsTimeoutRef.current);
    }
    seekControlsTimeoutRef.current = window.setTimeout(() => {
      setShowSeekControls(false);
      seekControlsTimeoutRef.current = null;
    }, 2200);
  };

  const emitDuration = () => {
    if (typeof playerRef.current?.getDuration !== "function") return;
    const duration = Number(playerRef.current.getDuration());
    if (Number.isFinite(duration) && duration > 0) {
      onDurationChangeRef.current?.(duration);
    }
  };

  useEffect(() => {
    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }

    function initPlayer() {
      if (containerRef.current && !playerRef.current) {
        playerRef.current = new (window as any).YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            autoplay: isPlaying ? 1 : 0,
            controls: showPlayButton ? 1 : 0,
            mute: muted ? 1 : 0,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              if (event?.target) {
                playerRef.current = event.target;
              }
              setPlayerReady(true);
              if (muted && typeof event?.target?.mute === "function") {
                event.target.mute();
              }
              emitDuration();
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
                emitDuration();
                if (tickIntervalRef.current) {
                  window.clearInterval(tickIntervalRef.current);
                }
                tickIntervalRef.current = window.setInterval(() => {
                  if (!playerRef.current?.getCurrentTime) return;
                  const t = Number(playerRef.current.getCurrentTime().toFixed(2));
                  onTimeUpdateRef.current?.(t);
                }, 1000);
              } else if (event.data === yt.PlayerState.BUFFERING) {
                if (playerRef.current?.getCurrentTime) {
                  const t = Number(playerRef.current.getCurrentTime().toFixed(2));
                  onTimeUpdateRef.current?.(t);
                }
              } else if (event.data === yt.PlayerState.PAUSED || event.data === yt.PlayerState.ENDED) {
                onPlaybackStateChangeRef.current?.(false);
                emitDuration();
                if (event.data === yt.PlayerState.ENDED) {
                  onEndedRef.current?.();
                }
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

  useEffect(() => {
    if (!showRegieSeekControls) {
      setShowSeekControls(false);
      if (seekControlsTimeoutRef.current !== null) {
        window.clearTimeout(seekControlsTimeoutRef.current);
        seekControlsTimeoutRef.current = null;
      }
    }

    return () => {
      if (seekControlsTimeoutRef.current !== null) {
        window.clearTimeout(seekControlsTimeoutRef.current);
        seekControlsTimeoutRef.current = null;
      }
    };
  }, [showRegieSeekControls]);

  return (
    <div className={`relative ${theme === "dark" ? "bg-gradient-to-br from-slate-800 to-slate-900" : "bg-gradient-to-br from-gray-200 to-gray-300"} rounded-xl overflow-hidden`}>
      {showBadge && (
        <Badge className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1 z-10">
          {label}
        </Badge>
      )}

      <div
        className="relative w-full aspect-video"
        onMouseMove={revealSeekControls}
        onMouseEnter={revealSeekControls}
        onClick={revealSeekControls}
        onTouchStart={revealSeekControls}
      >
        <div ref={containerRef} className="w-full h-full" />
        {!canControl && <div className="absolute inset-0 z-10" />}
      </div>

      {showRegieSeekControls && (
        <>
          <button
            type="button"
            onClick={() => {
              revealSeekControls();
              onSeekBackward?.();
            }}
            disabled={disableRegieSeekControls}
            className={`absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-40 ${
              showSeekControls ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            -10s
          </button>
          <button
            type="button"
            onClick={() => {
              revealSeekControls();
              onSeekForward?.();
            }}
            disabled={disableRegieSeekControls}
            className={`absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-40 ${
              showSeekControls ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            +10s
          </button>
        </>
      )}

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
