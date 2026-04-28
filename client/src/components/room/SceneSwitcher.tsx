/**
 * Projet : WithYou
 * Fichier : components/room/SceneSwitcher.tsx
 *
 * Description :
 * Composant de sélection de scène pour la Régie vidéo.
 * Permet à l'admin / régie de switcher entre 4 modes d'affichage :
 *   - cinema    : Plein écran vidéo (panneau droit masqué)
 *   - split     : Vidéo + Chat côte à côte (layout par défaut)
 *   - party     : Vidéo + Participants (Watch Party)
 *   - interlude : Écran d'attente stylisé (pause)
 *
 * Utilisé dans RoomPage.tsx (header, admin/regie uniquement).
 */

import { useState, useRef, useEffect } from "react";
import { Clapperboard, LayoutPanelLeft, Users, Clock, ChevronDown } from "lucide-react";

export type SceneMode = "cinema" | "split" | "party" | "interlude";

interface SceneConfig {
  id: SceneMode;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  bgActive: string;
}

const SCENES: SceneConfig[] = [
  {
    id: "cinema",
    label: "Cinéma",
    sublabel: "Plein écran",
    icon: <Clapperboard className="w-4 h-4" />,
    color: "text-purple-400",
    bgActive: "from-purple-600 to-purple-800",
  },
  {
    id: "split",
    label: "Split",
    sublabel: "Vidéo + Chat",
    icon: <LayoutPanelLeft className="w-4 h-4" />,
    color: "text-blue-400",
    bgActive: "from-blue-600 to-blue-800",
  },
  {
    id: "party",
    label: "Watch Party",
    sublabel: "Vidéo + Guests",
    icon: <Users className="w-4 h-4" />,
    color: "text-green-400",
    bgActive: "from-green-600 to-green-800",
  },
  {
    id: "interlude",
    label: "Interlude",
    sublabel: "Écran pause",
    icon: <Clock className="w-4 h-4" />,
    color: "text-amber-400",
    bgActive: "from-amber-600 to-amber-800",
  },
];

interface SceneSwitcherProps {
  currentScene: SceneMode;
  onSceneChange: (scene: SceneMode) => void;
  theme: "light" | "dark";
  canControl: boolean;
}

export function SceneSwitcher({
  currentScene,
  onSceneChange,
  theme,
  canControl,
}: SceneSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeScene = SCENES.find((s) => s.id === currentScene) ?? SCENES[1];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!canControl) return null;

  return (
    <div ref={ref} className="relative" style={{ zIndex: 60 }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium
          border transition-all duration-200 select-none
          ${
            theme === "dark"
              ? "bg-zinc-800/80 border-zinc-700 text-white hover:bg-zinc-700"
              : "bg-white/80 border-gray-300 text-black hover:bg-gray-100"
          }
          backdrop-blur-sm
        `}
        title="Changer de scène"
      >
        <span className={activeScene.color}>{activeScene.icon}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={`
            absolute top-full mt-2 right-0 w-56 rounded-xl overflow-hidden shadow-2xl
            border backdrop-blur-md
            ${
              theme === "dark"
                ? "bg-zinc-900/95 border-zinc-700"
                : "bg-white/95 border-gray-200"
            }
          `}
          style={{ animation: "sceneDrop 0.18s cubic-bezier(.16,1,.3,1)" }}
        >
          {/* Header */}
          <div
            className={`px-4 py-2.5 border-b text-xs font-semibold tracking-widest uppercase ${
              theme === "dark"
                ? "border-zinc-800 text-gray-500"
                : "border-gray-200 text-gray-400"
            }`}
          >
            🎥 Scènes — Régie
          </div>

          {/* Scene buttons */}
          <div className="p-2 space-y-1">
            {SCENES.map((scene) => {
              const isActive = scene.id === currentScene;
              return (
                <button
                  key={scene.id}
                  onClick={() => {
                    onSceneChange(scene.id);
                    setOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                    transition-all duration-150 group
                    ${
                      isActive
                        ? `bg-gradient-to-r ${scene.bgActive} text-white shadow-lg`
                        : theme === "dark"
                        ? "text-gray-300 hover:bg-zinc-800 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-black"
                    }
                  `}
                >
                  {/* Icon */}
                  <span
                    className={`
                      flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                      transition-colors duration-150
                      ${
                        isActive
                          ? "bg-white/20"
                          : theme === "dark"
                          ? `bg-zinc-800 group-hover:bg-zinc-700 ${scene.color}`
                          : `bg-gray-100 group-hover:bg-gray-200 ${scene.color}`
                      }
                    `}
                  >
                    {scene.icon}
                  </span>

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-tight ${isActive ? "text-white" : ""}`}>
                      {scene.label}
                    </p>
                    <p
                      className={`text-xs leading-tight ${
                        isActive ? "text-white/70" : theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {scene.sublabel}
                    </p>
                  </div>

                  {/* Active dot */}
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CSS animation */}
      <style>{`
        @keyframes sceneDrop {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}
