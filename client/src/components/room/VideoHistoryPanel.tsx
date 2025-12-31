import { X, History, Clock, User, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

interface VideoHistoryEntry {
  id: string;
  youtubeId?: string;
  title: string;
  thumbnail: string;
  duration: string;
  playedAt: string;
  playedBy: string;
}

interface VideoHistoryPanelProps {
  onClose: () => void;
  history: VideoHistoryEntry[];
  theme?: "light" | "dark";
}

export function VideoHistoryPanel({ 
  onClose, 
  history, 
  theme = "dark" 
}: VideoHistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = history.filter(entry => 
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.playedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'} shadow-2xl z-50 flex flex-col animate-slide-in-right`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-lg`}>Historique</h2>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                {history.length} vidéo{history.length > 1 ? 's' : ''} visionnée{history.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={`${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-zinc-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-800">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans l'historique..."
            className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-black'}`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredHistory.length === 0 ? (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
              <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {searchQuery ? 'Aucun résultat trouvé' : 'Aucune vidéo dans l\'historique'}
              </p>
              <p className="text-xs mt-2 opacity-75">
                {!searchQuery && 'Les vidéos visionnées apparaîtront ici'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-750' : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'} transition-colors`}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <img
                      src={entry.thumbnail}
                      alt={entry.title}
                      className="w-24 h-16 object-cover rounded flex-shrink-0"
                    />
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-black'} font-medium`}>
                        {entry.title}
                      </p>
                      
                      <div className={`flex items-center gap-2 mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{entry.playedBy}</span>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 mt-1 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{entry.playedAt}</span>
                        </div>
                        
                        <span>•</span>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{entry.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
