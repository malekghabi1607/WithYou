/**
 * Projet : WithYou
 * Fichier : components/room/LiveTranscriptionOverlay.tsx
 *
 * Description :
 * Overlay de sous-titres affiché sur le lecteur YouTube.
 * Deux modes :
 *   1. "captions"  ← Sous-titres réels de la vidéo YouTube (via Invidious API)
 *      → Synchronisés avec le temps de lecture. Mots-clés surlignés.
 *   2. "mic"       ← Transcription microphone (Speech Recognition)
 *      → Fallback si pas de captions disponibles pour cette vidéo.
 *
 * Feature F — Sous-titres enrichis avec mots-clés surlignés.
 */

import { useEffect, useState } from "react";
import { type CaptionLine } from "../../hooks/useYouTubeCaptions";
import { type TranscriptionWord } from "../../hooks/useLiveTranscription";

// ─── Mots-clés à surligner ────────────────────────────────────────────────────

const HIGHLIGHT_KEYWORDS = new Set([
  // Programmation/tech
  "variable", "fonction", "boucle", "tableau", "objet", "classe", "méthode",
  "algorithm", "algorithme", "données", "dataset", "intelligence", "artificielle",
  "machine", "learning", "réseau", "neural", "modèle", "model", "training",
  // Science/culture
  "découverte", "révolution", "histoire", "science", "univers", "nature",
  "important", "essentiel", "critique", "crucial", "fondamental", "clé",
  "nouveau", "première", "jamais", "record", "record", "meilleur",
  // Cinéma/musique
  "film", "cinéma", "musique", "scène", "émotion", "message", "thème",
  // Société
  "société", "monde", "avenir", "futur", "problème", "solution", "défi",
]);

function isKeyword(word: string): boolean {
  const clean = word.toLowerCase().replace(/[^a-zàâäéèêëîïôùûü]/gi, "");
  return HIGHLIGHT_KEYWORDS.has(clean) ||
    Array.from(HIGHLIGHT_KEYWORDS).some((kw) => clean.startsWith(kw) && clean.length <= kw.length + 3);
}

function renderHighlightedText(text: string) {
  if (!text) return null;
  return text.split(/\s+/).map((word, i) => (
    <span key={i}>
      {isKeyword(word) ? (
        <mark
          style={{
            background: "rgba(234,179,8,0.4)",
            color: "#FDE68A",
            borderRadius: "3px",
            padding: "0 3px",
            fontWeight: 700,
          }}
        >
          {word}
        </mark>
      ) : (
        <span>{word}</span>
      )}
      {" "}
    </span>
  ));
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface LiveTranscriptionOverlayProps {
  isActive: boolean;

  // Mode captions YouTube
  captionLine: CaptionLine | null;
  captionsAvailable: boolean;
  captionsLoading: boolean;
  captionsLanguage: string | null;

  // Mode microphone (fallback)
  isListening: boolean;
  words: TranscriptionWord[];
  micError: string | null;
  isSupported: boolean;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function LiveTranscriptionOverlay({
  isActive,
  captionLine,
  captionsAvailable,
  captionsLoading,
  captionsLanguage,
  isListening,
  words,
  micError,
  isSupported,
}: LiveTranscriptionOverlayProps) {
  // Animation "pop" quand la caption change
  const [key, setKey] = useState(0);
  const [prevText, setPrevText] = useState("");
  useEffect(() => {
    const text = captionLine?.text ?? "";
    if (text && text !== prevText) {
      setKey((k) => k + 1);
      setPrevText(text);
    }
  }, [captionLine?.text]);

  if (!isActive) return null;

  const mode: "captions" | "mic" | "loading" = captionsLoading
    ? "loading"
    : captionsAvailable
    ? "captions"
    : "mic";

  const langLabel = captionsLanguage?.startsWith("fr")
    ? "🇫🇷 FR"
    : captionsLanguage?.startsWith("ar")
    ? "🇩🇿 AR"
    : captionsLanguage?.startsWith("en")
    ? "🇬🇧 EN"
    : captionsLanguage?.toUpperCase() ?? "??";

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
      style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
        padding: "3rem 1rem 0.75rem",
        borderRadius: "0 0 0.75rem 0.75rem",
      }}
    >
      {/* ── Badge de statut ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-2">
        {mode === "loading" && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-white"
            style={{ background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            Chargement des sous-titres…
          </div>
        )}

        {mode === "captions" && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-white"
            style={{ background: "rgba(5,150,105,0.85)", backdropFilter: "blur(8px)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-white"
              style={{ animation: "ccPulse 2s ease-in-out infinite" }}
            />
            CC {langLabel}
          </div>
        )}

        {mode === "mic" && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-white"
            style={{
              background: isListening ? "rgba(239,68,68,0.85)" : "rgba(100,116,139,0.8)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-white"
              style={{ animation: isListening ? "ccPulse 1s ease-in-out infinite" : "none" }}
            />
            {isListening ? "🎙️ Micro actif" : "⏳ Démarrage micro…"}
          </div>
        )}

        {mode === "mic" && !captionsAvailable && !captionsLoading && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] text-amber-300/80"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            Sous-titres vidéo non disponibles
          </span>
        )}

        {!isSupported && mode === "mic" && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] text-red-300"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            ⚠️ Speech API non supportée
          </span>
        )}
      </div>

      {/* ── Sous-titre courant (mode captions) ──────────────────────────── */}
      {mode === "captions" && captionLine && (
        <div
          key={key}
          className="text-center px-4 py-2"
          style={{ animation: "ccFadeIn 0.15s ease-out" }}
        >
          <span
            className="text-white text-base font-semibold leading-relaxed"
            style={{
              textShadow: "0 1px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.8)",
              letterSpacing: "0.01em",
            }}
          >
            {renderHighlightedText(captionLine.text)}
          </span>
        </div>
      )}

      {/* Pas de ligne active mais captions dispo → rien à afficher, c'est normal */}
      {mode === "captions" && !captionLine && (
        <div className="text-center py-1">
          <span className="text-white/30 text-xs">…</span>
        </div>
      )}

      {/* ── Transcription micro (mode mic) ─────────────────────────────── */}
      {mode === "mic" && (
        <>
          {micError && (
            <div
              className="mb-2 px-3 py-2 rounded-lg text-xs text-amber-200"
              style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(251,191,36,0.3)" }}
            >
              ⚠️ {micError}
            </div>
          )}

          {words.length > 0 ? (
            <div
              className="px-3 py-2 rounded-lg text-sm leading-relaxed text-center"
              style={{
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {words.map((item, idx) => (
                <span key={idx}>
                  {item.isKeyword ? (
                    <mark
                      style={{
                        background: "rgba(234,179,8,0.4)",
                        color: "#FDE68A",
                        borderRadius: "2px",
                        padding: "0 2px",
                        fontWeight: 700,
                      }}
                    >
                      {item.word}
                    </mark>
                  ) : (
                    <span className="text-white/90">{item.word}</span>
                  )}
                  {idx < words.length - 1 && " "}
                </span>
              ))}
            </div>
          ) : isListening ? (
            <div className="text-center py-1">
              <span className="text-white/40 text-xs italic">En attente de la parole…</span>
            </div>
          ) : null}
        </>
      )}

      {/* ── Animations CSS ───────────────────────────────────────────────── */}
      <style>{`
        @keyframes ccPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes ccFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
