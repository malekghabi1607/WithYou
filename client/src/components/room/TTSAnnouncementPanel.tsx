/**
 * Projet : WithYou
 * Fichier : components/room/TTSAnnouncementPanel.tsx
 *
 * Description :
 * Panneau de la régie pour taper un message et le diffuser à voix haute (TTS)
 * à tous les participants via Web Speech API (SpeechSynthesis).
 *  - La régie tape un texte et clique "Diffuser"
 *  - Un événement broadcast est envoyé à tous (room_tts_announce)
 *  - Chaque client reçoit le message et le lit via window.speechSynthesis
 *
 * Utilisé dans RoomPage.tsx (bouton dans le header admin/regie).
 */

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Send, Mic, X, ChevronDown } from "lucide-react";

interface TTSAnnouncementPanelProps {
  onAnnounce: (text: string) => void;
  theme: "light" | "dark";
  onClose: () => void;
}

const QUICK_MESSAGES = [
  "Bienvenue dans le salon !",
  "La session commence dans 30 secondes.",
  "Attention, la vidéo va démarrer.",
  "Pause de 5 minutes.",
  "La session est terminée, merci !",
  "Veuillez désactiver vos micros.",
];

export function TTSAnnouncementPanel({ onAnnounce, theme, onClose }: TTSAnnouncementPanelProps) {
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showQuick, setShowQuick] = useState(false);
  const [rate, setRate] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDark = theme === "dark";

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis?.getVoices() || [];
      // Prefer French voices
      const frVoices = available.filter((v) => v.lang.startsWith("fr"));
      const sorted = [...frVoices, ...available.filter((v) => !v.lang.startsWith("fr"))];
      setVoices(sorted);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const handleSend = () => {
    if (!text.trim()) return;
    onAnnounce(text.trim());
    // Local preview: also speak immediately for the régie
    speakLocally(text.trim());
    setText("");
  };

  const speakLocally = (message: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = voices[voiceIndex]?.lang || "fr-FR";
    if (voices[voiceIndex]) utterance.voice = voices[voiceIndex];
    utterance.rate = rate;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const handleQuick = (msg: string) => {
    setText(msg);
    setShowQuick(false);
    textareaRef.current?.focus();
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "5rem",
        right: "1.5rem",
        width: "360px",
        zIndex: 500,
        borderRadius: "1rem",
        overflow: "hidden",
        boxShadow: isDark
          ? "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)"
          : "0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)",
        background: isDark ? "#18181b" : "#fff",
        fontFamily: "Inter, sans-serif",
        animation: "ttsSlideUp 0.22s cubic-bezier(.23,1,.32,1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
          padding: "0.875rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Volume2 style={{ width: 18, height: 18, color: "white" }} />
          <span style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
            Annonce vocale (TTS)
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            color: "white",
          }}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {/* Textarea */}
        <div style={{ position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSend();
            }}
            placeholder="Tapez votre message à lire à voix haute…"
            rows={3}
            style={{
              width: "100%",
              resize: "none",
              borderRadius: "0.625rem",
              border: isDark ? "1.5px solid #3f3f46" : "1.5px solid #e4e4e7",
              background: isDark ? "#27272a" : "#f4f4f5",
              color: isDark ? "#f4f4f5" : "#18181b",
              padding: "0.625rem 0.75rem",
              fontSize: "0.875rem",
              outline: "none",
              fontFamily: "Inter, sans-serif",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) =>
              ((e.target as HTMLTextAreaElement).style.borderColor = "#8b5cf6")
            }
            onBlur={(e) =>
              ((e.target as HTMLTextAreaElement).style.borderColor = isDark ? "#3f3f46" : "#e4e4e7")
            }
          />
          <span
            style={{
              position: "absolute",
              bottom: "0.4rem",
              right: "0.6rem",
              fontSize: "0.7rem",
              color: isDark ? "#52525b" : "#a1a1aa",
            }}
          >
            Ctrl+↵
          </span>
        </div>

        {/* Quick messages */}
        <div>
          <button
            onClick={() => setShowQuick((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.75rem",
              color: isDark ? "#a1a1aa" : "#71717a",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 0",
            }}
          >
            <Mic style={{ width: 12, height: 12 }} />
            Messages rapides
            <ChevronDown
              style={{
                width: 12,
                height: 12,
                transform: showQuick ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {showQuick && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
                marginTop: "0.4rem",
                animation: "ttsSlideUp 0.15s ease",
              }}
            >
              {QUICK_MESSAGES.map((msg) => (
                <button
                  key={msg}
                  onClick={() => handleQuick(msg)}
                  style={{
                    textAlign: "left",
                    padding: "0.4rem 0.65rem",
                    borderRadius: "0.5rem",
                    border: isDark ? "1px solid #3f3f46" : "1px solid #e4e4e7",
                    background: isDark ? "#27272a" : "#f9f9f9",
                    color: isDark ? "#d4d4d8" : "#3f3f46",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = isDark ? "#3f3f46" : "#ececec")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = isDark ? "#27272a" : "#f9f9f9")
                  }
                >
                  {msg}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Voice selector + speed */}
        {voices.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select
              value={voiceIndex}
              onChange={(e) => setVoiceIndex(Number(e.target.value))}
              style={{
                flex: 1,
                padding: "0.35rem 0.5rem",
                borderRadius: "0.5rem",
                border: isDark ? "1px solid #3f3f46" : "1px solid #e4e4e7",
                background: isDark ? "#27272a" : "#f4f4f5",
                color: isDark ? "#d4d4d8" : "#3f3f46",
                fontSize: "0.75rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {voices.slice(0, 20).map((v, i) => (
                <option key={i} value={i}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>

            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ fontSize: "0.7rem", color: isDark ? "#71717a" : "#a1a1aa", whiteSpace: "nowrap" }}>
                ×{rate.toFixed(1)}
              </span>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                style={{ width: "60px", accentColor: "#8b5cf6" }}
                title="Vitesse de lecture"
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {isSpeaking ? (
            <button
              onClick={handleStop}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                padding: "0.6rem 1rem",
                borderRadius: "0.625rem",
                border: "none",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                animation: "ttsPulseBtn 1.5s ease-in-out infinite",
              }}
            >
              <VolumeX style={{ width: 16, height: 16 }} />
              Arrêter
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                padding: "0.6rem 1rem",
                borderRadius: "0.625rem",
                border: "none",
                background: text.trim()
                  ? "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                  : isDark
                  ? "#3f3f46"
                  : "#e4e4e7",
                color: text.trim() ? "white" : isDark ? "#71717a" : "#a1a1aa",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: text.trim() ? "pointer" : "not-allowed",
                transition: "opacity 0.2s",
              }}
            >
              <Send style={{ width: 16, height: 16 }} />
              Diffuser à voix haute
            </button>
          )}
        </div>

        <p
          style={{
            fontSize: "0.7rem",
            color: isDark ? "#52525b" : "#a1a1aa",
            textAlign: "center",
            margin: 0,
          }}
        >
          Le message sera lu automatiquement pour tous les participants.
        </p>
      </div>

      <style>{`
        @keyframes ttsSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ttsPulseBtn {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}

/**
 * Fonction utilitaire : lit un message TTS localement.
 * Appelée côté récepteur (tous les participants) quand le broadcast arrive.
 */
export function speakTTSMessage(text: string, voiceLang = "fr-FR") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voiceLang;
  // Try to find a French voice
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find((v) => v.lang.startsWith("fr"));
  if (frVoice) utterance.voice = frVoice;
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}
