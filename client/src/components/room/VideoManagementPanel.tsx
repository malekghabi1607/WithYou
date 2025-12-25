


/**
 * Projet : WithYou
 * Fichier : components/room/VideoManagementPanel.tsx
 *
 * Description :
 * Panneau latéral (drawer) permettant de gérer la playlist vidéo d’un salon.
 * Il offre deux modes :
 *  - Ajout de nouvelles vidéos
 *  - Gestion / suppression des vidéos existantes
 *
 * Fonctionnalités principales :
 * - Ajout de vidéos via URL (YouTube, Vimeo, liens directs, etc.)
 * - Extraction automatique de l’ID YouTube si disponible
 * - Recherche de vidéos dans la playlist
 * - Suppression des vidéos (hors vidéo en cours de lecture)
 * - Indication visuelle de la vidéo actuellement lue
 *
 * UX :
 * - Interface en panneau coulissant
 * - Onglets "Ajouter" et "Gérer"
 * - Notifications de succès/erreur avec Sonner
 *
 * Objectif :
 * Donner aux administrateurs un contrôle simple et efficace
 * sur la playlist du salon en temps réel.
 */


import { useState } from "react";
import { X, Plus, Trash2, Video, List, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { extractYouTubeId, getYouTubeThumbnail } from "../../utils/youtube";
import { toast } from "sonner";

interface VideoInPlaylist {
  id: string;
  youtubeId?: string;
  title: string;
  thumbnail: string;
  duration: string;
  isCurrent?: boolean;
  votes?: number;
  isFavorite?: boolean;
}

interface VideoManagementPanelProps {
  onClose: () => void;
  videos: VideoInPlaylist[];
  onAddVideo: (url: string, title: string, youtubeId?: string) => void;
  onRemoveVideo: (videoId: string) => void;
  theme?: "light" | "dark";
}

export function VideoManagementPanel({ 
  onClose, 
  videos, 
  onAddVideo, 
  onRemoveVideo,
  theme = "dark" 
}: VideoManagementPanelProps) {
  const [activeTab, setActiveTab] = useState<"add" | "manage">("add");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddVideo = () => {
    if (videoUrl.trim() && videoTitle.trim()) {
      // Extraire l'ID YouTube de l'URL
      const youtubeId = extractYouTubeId(videoUrl);
      onAddVideo(videoUrl, videoTitle, youtubeId || undefined);
      setVideoUrl("");
      setVideoTitle("");
      
      if (youtubeId) {
        toast.success(`Vidéo YouTube ajoutée avec succès !`);
      } else {
        toast.success(`Vidéo ajoutée !`);
      }
    }
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
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
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-lg`}>Gestion Vidéos</h2>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                Gérer la playlist du salon
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

        {/* Tabs */}
        <div className={`flex border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors ${
              activeTab === "add"
                ? "bg-red-600 text-white"
                : theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
            }`}
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`flex-1 px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors ${
              activeTab === "manage"
                ? "bg-red-600 text-white"
                : theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
            }`}
          >
            <List className="w-4 h-4" />
            Gérer ({videos.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "add" ? (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                  URL de la vidéo
                </label>
                <Input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                  Titre de la vidéo
                </label>
                <Input
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Nom de la vidéo..."
                  className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>

              <Button
                onClick={handleAddVideo}
                disabled={!videoUrl.trim() || !videoTitle.trim()}
                className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter à la playlist
              </Button>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 border border-zinc-700' : 'bg-gray-100 border border-gray-200'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                  <strong>Plateformes supportées :</strong>
                </p>
                <ul className={`text-sm mt-2 space-y-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                  <li>• YouTube</li>
                  <li>• Vimeo</li>
                  <li>• Dailymotion</li>
                  <li>• Liens vidéo directs (.mp4, .webm)</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une vidéo..."
                  className={`pl-10 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>

              {/* Video List */}
              <div className="space-y-2">
                {filteredVideos.length === 0 ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Aucune vidéo trouvée</p>
                  </div>
                ) : (
                  filteredVideos.map((video) => (
                    <div
                      key={video.id}
                      className={`p-3 rounded-lg flex items-center gap-3 ${
                        video.isCurrent 
                          ? 'bg-red-600/20 border-2 border-red-600' 
                          : theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          {video.title}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                          {video.duration}
                        </p>
                      </div>
                      {!video.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveVideo(video.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-100/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}