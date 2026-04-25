/**
 * Projet : WithYou
 * Fichier : components/room/AIDiscussionQuestions.tsx
 *
 * Description :
 * Composant affichant 3 questions de discussion générées par l'IA après chaque vidéo.
 * Les questions sont contextualisées selon le titre et la catégorie de la vidéo.
 * Chaque question est cliquable pour être envoyée dans le chat.
 *
 * Feature E — Génération de questions de discussion.
 */

import { useState } from "react";
import { MessageCircle, Sparkles, ChevronDown, ChevronUp, Send } from "lucide-react";

interface AIDiscussionQuestionsProps {
  questions: [string, string, string];
  videoTitle: string;
  onSendQuestion: (question: string) => void;
  theme: "light" | "dark";
}

export function AIDiscussionQuestions({
  questions,
  videoTitle,
  onSendQuestion,
  theme,
}: AIDiscussionQuestionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sentIdx, setSentIdx] = useState<Set<number>>(new Set());

  const handleSend = (question: string, idx: number) => {
    onSendQuestion(question);
    setSentIdx((prev) => new Set(prev).add(idx));
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-xl overflow-hidden border transition-all duration-300`}
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(109,40,217,0.08) 100%)"
          : "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(109,40,217,0.04) 100%)",
        borderColor: isDark ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.2)",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${
          isDark ? "hover:bg-purple-900/20" : "hover:bg-purple-50"
        }`}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(139,92,246,0.25)" }}
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-semibold"
            style={{ color: isDark ? "#C4B5FD" : "#7C3AED" }}
          >
            🤖 IA Discussion
          </p>
          <p
            className="text-[10px] truncate"
            style={{ color: isDark ? "rgba(196,181,253,0.6)" : "rgba(124,58,237,0.6)" }}
          >
            {videoTitle}
          </p>
        </div>
        <MessageCircle
          className="w-3.5 h-3.5 flex-shrink-0"
          style={{ color: isDark ? "#A78BFA" : "#7C3AED" }}
        />
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 text-purple-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-3 h-3 text-purple-400 flex-shrink-0" />
        )}
      </button>

      {/* Questions */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className={`group relative flex items-start gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                sentIdx.has(idx)
                  ? isDark
                    ? "border-green-500/30 bg-green-900/10"
                    : "border-green-400/30 bg-green-50"
                  : isDark
                  ? "border-purple-500/20 bg-zinc-800/60 hover:border-purple-500/40 hover:bg-zinc-800"
                  : "border-purple-200 bg-white hover:border-purple-400 hover:bg-purple-50"
              }`}
              onClick={() => !sentIdx.has(idx) && handleSend(q, idx)}
              title={sentIdx.has(idx) ? "Déjà envoyé" : "Cliquer pour envoyer dans le chat"}
            >
              <span className="text-[13px] text-xs leading-snug flex-1" style={{
                color: sentIdx.has(idx)
                  ? isDark ? "#86EFAC" : "#16A34A"
                  : isDark ? "#E2E8F0" : "#1E293B",
              }}>
                {q}
              </span>
              {sentIdx.has(idx) ? (
                <span className="flex-shrink-0 text-[10px] font-medium" style={{
                  color: isDark ? "#86EFAC" : "#16A34A"
                }}>✓</span>
              ) : (
                <Send
                  className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: isDark ? "#A78BFA" : "#7C3AED" }}
                />
              )}
            </div>
          ))}

          <p className="text-[10px] text-center" style={{
            color: isDark ? "rgba(167,139,250,0.5)" : "rgba(124,58,237,0.4)"
          }}>
            Cliquez sur une question pour l'envoyer dans le chat
          </p>
        </div>
      )}
    </div>
  );
}
