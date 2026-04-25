/**
 * Projet : WithYou
 * Fichier : components/room/InterludeScreen.tsx
 *
 * Description :
 * Écran d'attente cinématographique affiché pendant la scène "Interlude".
 * Remplace le lecteur vidéo avec une animation de fond gradient, le nom
 * du salon, une icône pause animée et un badge "⏸ PAUSE" clignotant.
 *
 * Utilisé dans RoomPage.tsx lorsque currentScene === 'interlude'.
 */

import { useEffect, useState } from "react";
import { Pause } from "lucide-react";

interface InterludeScreenProps {
  roomName?: string;
  theme: "light" | "dark";
  /** Message configurable affiché sous le nom du salon */
  message?: string;
}

export function InterludeScreen({
  roomName = "Salon",
  theme,
  message = "Reprise dans un instant…",
}: InterludeScreenProps) {
  const [dots, setDots] = useState(".");

  // Animated ellipsis
  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative w-full aspect-video rounded-xl overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ minHeight: 320 }}
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(135deg, #0f0c29, #302b63, #24243e)"
              : "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
          backgroundSize: "400% 400%",
          animation: "interludeGradient 8s ease infinite",
        }}
      />

      {/* Grain overlay for cinematic look */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Letterbox bars (cinematic effect) */}
      <div className="absolute top-0 left-0 right-0 h-[8%] bg-black/80 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[8%] bg-black/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        {/* Pause icon with pulsing ring */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulse rings */}
          <span
            className="absolute w-32 h-32 rounded-full border border-white/10"
            style={{ animation: "interludePulse 2.4s ease-out infinite" }}
          />
          <span
            className="absolute w-24 h-24 rounded-full border border-white/15"
            style={{ animation: "interludePulse 2.4s ease-out 0.6s infinite" }}
          />
          <span
            className="absolute w-16 h-16 rounded-full border border-white/20"
            style={{ animation: "interludePulse 2.4s ease-out 1.2s infinite" }}
          />

          {/* Center icon */}
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
            <Pause className="w-9 h-9 text-white/90" />
          </div>
        </div>

        {/* PAUSE badge */}
        <div
          className="flex items-center gap-2 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full shadow-lg"
          style={{ animation: "interludeBlink 2s ease-in-out infinite" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white" style={{ animation: "interludeBlink 1s ease-in-out infinite" }} />
          INTERLUDE
        </div>

        {/* Room name */}
        <div className="space-y-1.5">
          <h2 className="text-white text-xl font-semibold tracking-tight drop-shadow-lg">
            {roomName}
          </h2>
          <p className="text-white/60 text-sm font-light tracking-wide">
            {message}
            <span className="inline-block w-6 text-left">{dots}</span>
          </p>
        </div>

        {/* Decorative horizontal rule */}
        <div className="flex items-center gap-3 w-40">
          <div className="flex-1 h-px bg-white/15" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <div className="flex-1 h-px bg-white/15" />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes interludeGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes interludePulse {
          0%   { transform: scale(0.95); opacity: 0.8; }
          70%  { transform: scale(1.4);  opacity: 0; }
          100% { transform: scale(1.4);  opacity: 0; }
        }
        @keyframes interludeBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}
