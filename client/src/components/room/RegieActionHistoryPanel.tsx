import { useMemo, useState } from "react";
import {
  X,
  History,
  Clock,
  User,
  Search,
  Megaphone,
  Play,
  Pause,
  Shield,
  Plus,
  Trash2,
  Radio,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export interface RegieActionEntry {
  id: string;
  type:
    | "announcement"
    | "play"
    | "pause"
    | "sync"
    | "session_lock"
    | "video_bookmark"
    | "video_play"
    | "video_add"
    | "video_remove"
    | "video_batch_add"
    | "assign_regie";
  label: string;
  details?: string;
  byName: string;
  createdAt: string;
}

interface RegieActionHistoryPanelProps {
  onClose: () => void;
  history: RegieActionEntry[];
  theme?: "light" | "dark";
}

function getActionIcon(type: RegieActionEntry["type"]) {
  switch (type) {
    case "announcement":
      return Megaphone;
    case "play":
    case "video_play":
      return Play;
    case "pause":
      return Pause;
    case "assign_regie":
    case "session_lock":
      return Shield;
    case "video_bookmark":
      return Clock;
    case "video_add":
    case "video_batch_add":
      return Plus;
    case "video_remove":
      return Trash2;
    case "sync":
    default:
      return Radio;
  }
}

export function RegieActionHistoryPanel({
  onClose,
  history,
  theme = "dark",
}: RegieActionHistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return history;

    return history.filter((entry) =>
      [entry.label, entry.details, entry.byName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [history, searchQuery]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl animate-slide-in-right ${
          theme === "dark" ? "bg-zinc-900" : "bg-white"
        }`}
      >
        <div
          className={`flex items-center justify-between p-6 border-b ${
            theme === "dark" ? "border-zinc-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className={`${theme === "dark" ? "text-white" : "text-black"} text-lg`}>
                Historique regie
              </h2>
              <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-sm`}>
                {history.length} action{history.length > 1 ? "s" : ""} enregistree{history.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={`${
              theme === "dark"
                ? "text-gray-400 hover:text-white hover:bg-zinc-800"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className={`p-4 border-b ${theme === "dark" ? "border-zinc-800" : "border-gray-200"}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une action..."
              className={`pl-10 ${
                theme === "dark"
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredHistory.length === 0 ? (
            <div className={`text-center py-12 ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
              <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {searchQuery ? "Aucune action trouvee" : "Aucune action regie pour l'instant"}
              </p>
              <p className="text-xs mt-2 opacity-75">
                {!searchQuery && "Les actions importantes de la regie apparaitront ici"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((entry) => {
                const Icon = getActionIcon(entry.type);
                return (
                  <div
                    key={entry.id}
                    className={`rounded-lg p-3 transition-colors ${
                      theme === "dark"
                        ? "bg-zinc-800 hover:bg-zinc-750"
                        : "bg-gray-100 hover:bg-gray-200 border border-gray-200"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-amber-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>
                          {entry.label}
                        </p>

                        {entry.details && (
                          <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {entry.details}
                          </p>
                        )}

                        <div className={`flex items-center gap-3 mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{entry.byName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{entry.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
