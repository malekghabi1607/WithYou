/**
 * Projet : WithYou
 * Fichier : components/room/RoomContentPanel.tsx
 *
 * Description :
 * Panneau latéral "Contenu du Salon" — remplace le bouton sous-titres/micro.
 * Affiche toutes les vidéos de la playlist avec un résumé IA détaillé
 * généré pour chacune (via useVideoAIPreview → oEmbed + Gemini/templates).
 *
 * Visible par tous les participants.
 */

import { useState } from "react";
import { X, BookOpen, Lightbulb, MessageSquare, Tag, Sparkles, Loader2, Clock, Youtube, ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import { useVideoAIPreview } from "../../hooks/useVideoAIPreview";
import { detectVideoCategory } from "../../utils/videoContentScore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  youtubeId?: string;
  isCurrent?: boolean;
}

interface RoomContentPanelProps {
  playlist: VideoItem[];
  roomName: string;
  theme: "light" | "dark";
  onClose: () => void;
}

// ─── Constantes design ────────────────────────────────────────────────────────

const CAT_EMOJI: Record<string, string> = {
  "Cinéma": "🎬", "Documentaire": "🌍", "Musique": "🎵", "Gaming": "🎮",
  "Tech": "💻", "Sport": "⚽", "Comédie": "😂", "Débat": "🗣️",
  "Nature": "🌿", "Culture": "🏛️", "Général": "📹",
};

const LINE_ICONS   = [BookOpen, MessageSquare, Lightbulb];
const LINE_COLORS  = ["#DC2626", "#7C3AED", "#059669"];
const LINE_BG      = ["rgba(220,38,38,0.07)","rgba(124,58,237,0.07)","rgba(5,150,105,0.07)"];
const LINE_BORDER  = ["rgba(220,38,38,0.18)","rgba(124,58,237,0.18)","rgba(5,150,105,0.18)"];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ w = "100%", h = "0.75rem" }: { w?: string; h?: string }) {
  return (
    <div
      className="rounded animate-pulse"
      style={{ width: w, height: h, background: "rgba(255,255,255,0.07)" }}
    />
  );
}

// ─── Carte résumé d'une vidéo ─────────────────────────────────────────────────

function VideoSummaryCard({
  video,
  theme,
  defaultOpen,
}: {
  video: VideoItem;
  theme: "light" | "dark";
  defaultOpen: boolean;
}) {
  const isDark = theme === "dark";
  const [expanded, setExpanded] = useState(defaultOpen);

  const { data, isLoading } = useVideoAIPreview(
    video.youtubeId,
    video.title,
    video.duration
  );

  const category      = data?.category || detectVideoCategory(video.title);
  const displayTitle  = data?.realTitle || video.title;
  const channelName   = data?.channelName || "";
  const summaryLines  = data?.summary?.lines;
  const keywords      = data?.summary?.keywords || [];
  const isGemini      = data?.summary?.generatedBy === "gemini";
  const watchNote     = data?.summary?.watchPartySuitability || "";
  const catEmoji      = CAT_EMOJI[category] || "📹";

  const thumb = data?.thumbnailUrl ||
    (video.youtubeId
      ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
      : video.thumbnail);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: video.isCurrent
          ? isDark ? "rgba(220,38,38,0.08)" : "rgba(220,38,38,0.05)"
          : isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        border: video.isCurrent
          ? "1px solid rgba(220,38,38,0.3)"
          : isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
      }}
    >
      {/* ── Header cliquable ── */}
      <button
        className="w-full flex items-center gap-3 p-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Thumbnail */}
        <div className="relative flex-shrink-0 w-16 h-10 rounded-lg overflow-hidden">
          <img
            src={thumb}
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = video.thumbnail || "";
            }}
          />
          {video.isCurrent && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(220,38,38,0.55)" }}
            >
              <PlayCircle className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[12px] font-semibold leading-snug line-clamp-2"
            style={{ color: isDark ? "#F1F5F9" : "#1E293B" }}
          >
            {displayTitle}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px]" style={{ color: isDark ? "#94A3B8" : "#6B7280" }}>
              {catEmoji} {category}
            </span>
            {video.duration && video.duration !== "0:00" && (
              <span className="flex items-center gap-0.5 text-[10px]" style={{ color: isDark ? "#94A3B8" : "#6B7280" }}>
                <Clock className="w-2.5 h-2.5" />
                {video.duration}
              </span>
            )}
            {video.isCurrent && (
              <span
                className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                style={{ background: "rgba(220,38,38,0.2)", color: "#F87171" }}
              >
                EN COURS
              </span>
            )}
            {isLoading && (
              <Loader2 className="w-3 h-3 animate-spin" style={{ color: isDark ? "#7C3AED" : "#6D28D9" }} />
            )}
          </div>
        </div>

        {/* Chevron */}
        {expanded
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? "#64748B" : "#94A3B8" }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? "#64748B" : "#94A3B8" }} />
        }
      </button>

      {/* ── Résumé (accordéon) ── */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2.5">
          {/* Canal */}
          {channelName && (
            <div className="flex items-center gap-1.5">
              <Youtube className="w-3 h-3 text-red-400" />
              <span className="text-[10px]" style={{ color: isDark ? "#94A3B8" : "#6B7280" }}>
                {channelName}
              </span>
              {isGemini && (
                <span
                  className="ml-auto flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                  style={{
                    background: "rgba(124,58,237,0.15)",
                    color: isDark ? "#C4B5FD" : "#7C3AED",
                    border: "1px solid rgba(124,58,237,0.2)",
                  }}
                >
                  <Sparkles className="w-2 h-2" /> Gemini
                </span>
              )}
            </div>
          )}

          {/* 3 paragraphes du résumé */}
          {summaryLines ? (
            <div className="space-y-3">
              {[
                { label: "Contexte", icon: "📋" },
                { label: "Intéret pour le groupe", icon: "👥" },
                { label: "Conseils pour animer", icon: "💡" },
              ].map(({ label, icon }, idx) => (
                <div key={idx}>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1"
                    style={{ color: LINE_COLORS[idx] }}
                  >
                    {icon} {label}
                  </p>
                  <p
                    className="text-[12px] leading-relaxed"
                    style={{ color: isDark ? "#CBD5E1" : "#374151" }}
                  >
                    {summaryLines[idx]}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {[0,1,2].map((i) => (
                <div key={i} className="flex gap-2 p-2.5 rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Skeleton w="20px" h="20px" />
                  <div className="flex-1 space-y-1">
                    <Skeleton w={i === 0 ? "90%" : i === 1 ? "100%" : "75%"} />
                    <Skeleton w={i === 0 ? "65%" : "80%"} h="0.6rem" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Watch party note */}
          {watchNote && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px]"
              style={{
                background: "rgba(5,150,105,0.07)",
                border: "1px solid rgba(5,150,105,0.18)",
                color: isDark ? "#6EE7B7" : "#047857",
              }}
            >
              <span>🎉</span> {watchNote}
            </div>
          )}

          {/* Mots-clés */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-medium"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                    color: isDark ? "#A78BFA" : "#7C3AED",
                    border: "1px solid rgba(124,58,237,0.15)",
                  }}
                >
                  <Tag className="w-2 h-2" />
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Panneau principal ────────────────────────────────────────────────────────

export function RoomContentPanel({ playlist, roomName, theme, onClose }: RoomContentPanelProps) {
  const isDark = theme === "dark";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Panel latéral */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
        style={{
          width: "min(420px, 100vw)",
          background: isDark
            ? "linear-gradient(160deg, #0F0F14 0%, #18181B 100%)"
            : "linear-gradient(160deg, #FAFAFA 0%, #F1F5F9 100%)",
          borderLeft: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.4)",
          animation: "slideInRight 0.28s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{
            background: "linear-gradient(90deg, rgba(220,38,38,0.9) 0%, rgba(124,58,237,0.9) 100%)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Sparkles className="w-4 h-4 text-white/90" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-[11px] font-bold tracking-widest uppercase">
              Contenu du Salon
            </p>
            <p className="text-white/60 text-[10px] truncate mt-0.5">
              {roomName} · {playlist.length} vidéo{playlist.length > 1 ? "s" : ""} — Résumés IA
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Liste des vidéos ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {playlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-4xl mb-3">📭</span>
              <p className="text-sm font-medium" style={{ color: isDark ? "#64748B" : "#9CA3AF" }}>
                Aucune vidéo dans la playlist
              </p>
              <p className="text-xs mt-1" style={{ color: isDark ? "#475569" : "#CBD5E1" }}>
                Ajoutez des vidéos pour voir leurs résumés IA ici
              </p>
            </div>
          ) : (
            playlist.map((video, idx) => (
              <VideoSummaryCard
                key={video.id}
                video={video}
                theme={theme}
                defaultOpen={idx === 0 || !!video.isCurrent}
              />
            ))
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center gap-2 px-5 py-3 flex-shrink-0 text-[10px]"
          style={{
            borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
            color: isDark ? "#475569" : "#9CA3AF",
          }}
        >
          <Sparkles className="w-3 h-3" />
          Résumés générés automatiquement par IA (YouTube oEmbed + Gemini)
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
