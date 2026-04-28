/**
 * Projet : WithYou
 * Fichier : components/room/AIVideoPreviewPanel.tsx
 *
 * Feature D — Résumé IA avant lancement vidéo (Admin / Régie uniquement)
 * Score supprimé — redesign centré sur le résumé généré par l'IA.
 */

import {
  X, Play, Clock, Youtube, Sparkles, Loader2,
  ExternalLink, BookOpen, MessageSquare, Lightbulb, Tag,
} from "lucide-react";
import { detectVideoCategory } from "../../utils/videoContentScore";
import { useVideoAIPreview } from "../../hooks/useVideoAIPreview";

interface VideoForPreview {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  youtubeId?: string;
}

interface AIVideoPreviewPanelProps {
  video: VideoForPreview;
  onConfirm: (video: VideoForPreview) => void;
  onCancel: () => void;
  theme: "light" | "dark";
}

// ─── Icônes par ligne du résumé ───────────────────────────────────────────────
const LINE_ICONS = [BookOpen, MessageSquare, Lightbulb];
const LINE_COLORS = ["#DC2626", "#7C3AED", "#059669"];
const LINE_BG    = ["rgba(220,38,38,0.08)", "rgba(124,58,237,0.08)", "rgba(5,150,105,0.08)"];
const LINE_BORDER = ["rgba(220,38,38,0.2)", "rgba(124,58,237,0.2)", "rgba(5,150,105,0.2)"];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = "0.8rem" }: { w?: string; h?: string }) {
  return (
    <div
      className="rounded-lg animate-pulse"
      style={{ width: w, height: h, background: "rgba(255,255,255,0.07)" }}
    />
  );
}

// ─── Category pill ────────────────────────────────────────────────────────────
const CAT_EMOJI: Record<string, string> = {
  "Cinéma": "🎬", "Documentaire": "🌍", "Musique": "🎵", "Gaming": "🎮",
  "Tech": "💻", "Sport": "⚽", "Comédie": "😂", "Débat": "🗣️",
  "Nature": "🌿", "Culture": "🏛️", "Général": "📹",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function AIVideoPreviewPanel({
  video,
  onConfirm,
  onCancel,
  theme,
}: AIVideoPreviewPanelProps) {
  const isDark = theme === "dark";

  const { data, isLoading, loadingStep } = useVideoAIPreview(
    video.youtubeId,
    video.title,
    video.duration
  );

  const thumbnailUrl =
    data?.thumbnailUrl ||
    (video.youtubeId
      ? `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`
      : video.thumbnail);

  const category    = data?.category || detectVideoCategory(video.title);
  const channelName = data?.channelName || "";
  const displayTitle = data?.realTitle || video.title;
  const summaryLines = data?.summary?.lines;
  const keywords     = data?.summary?.keywords || [];
  const isGemini   = data?.summary?.generatedBy === "gemini";
  const isDesc     = (data?.summary?.generatedBy as string) === "description";
  const watchPartyNote = data?.summary?.watchPartySuitability || "";

  const catEmoji = CAT_EMOJI[category] || "📹";

  /* ── Loading step label ── */
  const stepLabel: Record<string, string> = {
    oembed: "Récupération des informations YouTube…",
    details: "Lecture du contenu réel de la vidéo…",
    gemini: "L'IA analyse le vrai contenu de la vidéo…",
    done: "",
    idle: "",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: isDark
            ? "linear-gradient(160deg, #0F0F14 0%, #18181B 100%)"
            : "linear-gradient(160deg, #FAFAFA 0%, #F1F5F9 100%)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.07)"
            : "1px solid rgba(0,0,0,0.09)",
          animation: "aiPanelIn 0.3s cubic-bezier(0.16,1,0.3,1)",
          maxHeight: "94vh",
          overflowY: "auto",
        }}
      >

        {/* ── Header ── */}
        <div
          className="flex items-center gap-2.5 px-5 py-3 sticky top-0 z-10"
          style={{
            background: "linear-gradient(90deg, rgba(220,38,38,0.92) 0%, rgba(124,58,237,0.92) 100%)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Sparkles className="w-4 h-4 text-white/90" />
          <span className="text-white text-[11px] font-bold tracking-widest uppercase flex-1">
            Régie IA — Analyse avant diffusion
          </span>

          {/* Source badge */}
          {!isLoading && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1"
              style={{
                background: isGemini
                  ? "rgba(255,255,255,0.22)"
                  : isDesc
                  ? "rgba(255,255,255,0.16)"
                  : "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {isGemini ? (
                <><Sparkles className="w-2.5 h-2.5" /> Gemini AI</>
              ) : isDesc ? (
                <><Tag className="w-2.5 h-2.5" /> Contenu réel YouTube</>
              ) : (
                <><Tag className="w-2.5 h-2.5" /> Analyse auto</>
              )}
            </span>
          )}

          <button
            onClick={onCancel}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Loading bar ── */}
        {isLoading && (
          <div
            className="flex items-center gap-2.5 px-5 py-2"
            style={{
              background: "linear-gradient(90deg, rgba(124,58,237,0.1), rgba(220,38,38,0.07))",
              borderBottom: "1px solid rgba(124,58,237,0.15)",
            }}
          >
            <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin flex-shrink-0" />
            <span className="text-[11px]" style={{ color: isDark ? "#C4B5FD" : "#7C3AED" }}>
              {stepLabel[loadingStep] || "Analyse en cours…"}
            </span>
            {/* Animated progress dots */}
            <span className="ml-auto flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-purple-400"
                  style={{ animation: `dotPop 1.2s ${i * 0.2}s ease-in-out infinite` }}
                />
              ))}
            </span>
          </div>
        )}

        {/* ── Thumbnail ── */}
        <div className="relative">
          <img
            src={thumbnailUrl}
            alt={displayTitle}
            className="w-full object-cover"
            style={{ maxHeight: "196px" }}
            onError={(e) => {
              const t = e.currentTarget;
              if (video.youtubeId) {
                if (t.src.includes("maxresdefault")) {
                  t.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                } else if (t.src.includes("hqdefault")) {
                  t.src = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
                } else {
                  t.src = video.thumbnail || "";
                }
              } else {
                t.src = video.thumbnail || "";
              }
            }}
          />

          {/* Gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
            }}
          />

          {/* Category + duration badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white flex items-center gap-1"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              {catEmoji} {category}
            </span>
          </div>

          {video.duration && video.duration !== "0:00" && (
            <span
              className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] text-white"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <Clock className="w-3 h-3" />
              {video.duration}
            </span>
          )}

          {/* Title + channel */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6">
            <h3 className="text-white text-sm font-bold leading-snug line-clamp-2 mb-1.5">
              {displayTitle}
            </h3>
            {channelName && (
              <div className="flex items-center gap-1.5">
                <Youtube className="w-3 h-3 text-red-400 flex-shrink-0" />
                <span className="text-white/70 text-[11px] truncate flex-1">{channelName}</span>
                {data?.channelUrl && (
                  <a
                    href={data.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-4 space-y-4">

          {/* ── Résumé IA ── */}
          <div>
            {/* Titre section */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                style={{
                  background: isGemini
                    ? "linear-gradient(90deg, rgba(124,58,237,0.2), rgba(220,38,38,0.12))"
                    : isDesc
                    ? "linear-gradient(90deg, rgba(239,68,68,0.12), rgba(234,179,8,0.1))"
                    : "rgba(255,255,255,0.05)",
                  border: isGemini
                    ? "1px solid rgba(124,58,237,0.3)"
                    : isDesc
                    ? "1px solid rgba(239,68,68,0.2)"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: isGemini
                    ? (isDark ? "#C4B5FD" : "#7C3AED")
                    : isDesc
                    ? (isDark ? "#FCA5A5" : "#DC2626")
                    : (isDark ? "#9CA3AF" : "#6B7280"),
                }}
              >
                {isGemini ? (
                  <><Sparkles className="w-3 h-3" /> Résumé généré par Gemini AI</>
                ) : isDesc ? (
                  <><Tag className="w-3 h-3" /> Contenu réel de la vidéo</>
                ) : (
                  <><Tag className="w-3 h-3" /> Résumé automatique</>
                )}
              </div>
            </div>

            {/* Les 3 lignes du résumé */}
            {summaryLines ? (
              <div className="space-y-2.5">
                {summaryLines.map((line, idx) => {
                  const Icon = LINE_ICONS[idx];
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-2xl"
                      style={{
                        background: LINE_BG[idx],
                        border: `1px solid ${LINE_BORDER[idx]}`,
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: LINE_COLORS[idx] + "25", border: `1px solid ${LINE_COLORS[idx]}50` }}
                      >
                        <Icon className="w-3 h-3" style={{ color: LINE_COLORS[idx] }} />
                      </div>
                      <p
                        className="text-[12.5px] leading-relaxed flex-1"
                        style={{ color: isDark ? "#D1D5DB" : "#374151" }}
                      >
                        {/* Supprimer l'emoji de début si présent (📌, 🎯, 💡) */}
                        {String(line ?? "").replace(/^[\u{1F4CC}\u{1F3AF}\u{1F4A1}\u{1F3AC}\u{1F30D}\u{1F3B5}\u{1F3AE}\u{1F4BB}\u26BD\u{1F602}\u{1F5E3}\uFE0F]\s*/u, "")}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-2xl"
                    style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
                  >
                    <Skeleton w="24px" h="24px" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton w={i === 0 ? "80%" : i === 1 ? "95%" : "70%"} />
                      <Skeleton w={i === 0 ? "60%" : i === 1 ? "75%" : "50%"} h="0.65rem" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Watch party note */}
            {watchPartyNote && (
              <div
                className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px]"
                style={{
                  background: isDark ? "rgba(5,150,105,0.08)" : "rgba(5,150,105,0.05)",
                  border: "1px solid rgba(5,150,105,0.2)",
                  color: isDark ? "#6EE7B7" : "#047857",
                }}
              >
                <span>🎉</span>
                <span>{watchPartyNote}</span>
              </div>
            )}
          </div>

          {/* ── Mots-clés ── */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                    color: isDark ? "#A78BFA" : "#7C3AED",
                    border: "1px solid rgba(124,58,237,0.18)",
                  }}
                >
                  <Tag className="w-2.5 h-2.5" />
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all"
              style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                color: isDark ? "#9CA3AF" : "#6B7280",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              Annuler
            </button>
            <button
              onClick={() => onConfirm(video)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #DC2626 0%, #9B1C1C 100%)",
                boxShadow: "0 4px 20px rgba(220,38,38,0.4)",
              }}
            >
              <Play className="w-4 h-4 fill-white" />
              Lancer la vidéo
            </button>
          </div>
        </div>
      </div>

      {/* ── Animations ── */}
      <style>{`
        @keyframes aiPanelIn {
          from { opacity: 0; transform: scale(0.93) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes dotPop {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
