/**
 * Projet : WithYou
 * Fichier : components/room/SharedCountdownOverlay.tsx
 *
 * Description :
 * Overlay de compte à rebours partagé visible pour tous les participants.
 * Lancé par la régie, il affiche un décompte animé (ex : 3…2…1…Go !)
 * et se ferme automatiquement à la fin.
 *
 * Utilisé dans RoomPage.tsx (rendu pour tous).
 */

import { useEffect, useRef, useState } from "react";

interface SharedCountdownOverlayProps {
  /** Nombre de secondes total (ex: 3) */
  seconds: number;
  /** Callback appelé quand le compte à rebours est terminé */
  onFinished: () => void;
  theme: "light" | "dark";
}

export function SharedCountdownOverlay({ seconds, onFinished, theme }: SharedCountdownOverlayProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [phase, setPhase] = useState<"counting" | "go" | "done">("counting");
  const [pulse, setPulse] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const goTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFinishedRef = useRef(onFinished);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    // Pulse animation trigger on each second
    setPulse(true);
    const timeout = setTimeout(() => setPulse(false), 300);
    return () => clearTimeout(timeout);
  }, [remaining]);

  useEffect(() => {
    if (phase !== "counting") return;

    if (remaining <= 0) {
      setPhase("go");
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, remaining]);

  useEffect(() => {
    if (phase !== "go") return;

    goTimeoutRef.current = setTimeout(() => {
      setPhase("done");
      onFinishedRef.current();
    }, 1200);

    return () => {
      if (goTimeoutRef.current) {
        clearTimeout(goTimeoutRef.current);
        goTimeoutRef.current = null;
      }
    };
  }, [phase]);

  if (phase === "done") return null;

  const isDark = theme === "dark";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999, pointerEvents: "none" }}
    >
      {/* Backdrop blur */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isDark
            ? "rgba(0,0,0,0.72)"
            : "rgba(255,255,255,0.60)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          userSelect: "none",
        }}
      >
        {/* Top label */}
        <p
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.70)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {phase === "go" ? "La session commence maintenant..." : `La session commence dans ${remaining}...`}
        </p>

        {/* Main number / GO */}
        <div
          style={{
            fontSize: phase === "go" ? "10rem" : "14rem",
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: "'Inter', 'Outfit', sans-serif",
            transition: "font-size 0.25s cubic-bezier(.23,1,.32,1)",
            animation: pulse
              ? "cdPulse 0.3s cubic-bezier(.23,1,.32,1)"
              : "cdAppear 0.35s cubic-bezier(.23,1,.32,1)",
            backgroundImage:
              phase === "go"
                ? "linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)"
                : remaining === 1
                ? "linear-gradient(135deg, #ef4444 0%, #f97316 100%)"
                : remaining === 2
                ? "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)"
                : "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 40px rgba(139,92,246,0.45))",
          }}
        >
          {phase === "go" ? "GO !" : remaining}
        </div>

        {/* Progress dots */}
        {phase === "counting" && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {Array.from({ length: seconds }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background:
                    i < seconds - remaining
                      ? isDark
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(0,0,0,0.2)"
                      : "linear-gradient(135deg, #6366f1, #a855f7)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes cdPulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes cdAppear {
          from { opacity: 0; transform: scale(0.75); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
