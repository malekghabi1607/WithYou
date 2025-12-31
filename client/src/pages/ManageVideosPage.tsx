/**
 * Projet : WithYou
 * Fichier : pages/ManageVideosPage.tsx
 *
 * Description :
 * Page de gestion des vidéos d’un salon.
 *
 * Elle permet :
 *  - d’ajouter des vidéos à la playlist
 *  - de rechercher et filtrer les vidéos
 *  - de lancer la lecture d’une vidéo
 *  - de supprimer une vidéo existante
 *
 * Cette page est utilisée par l’administrateur
 * pour gérer la playlist du salon.
 */
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { 
  ArrowLeft, 
  Video, 
  Plus, 
  Search, 
  Filter,
  Play,
  Trash2,
  Check,
  Clock,
  User,
  Link as LinkIcon,
  AlertCircle
} from "lucide-react";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  url: string;
  addedBy: string;
  addedAt: string;
  status: "active" | "pending";
}

interface ManageVideosPageProps {
  onBack: () => void;
  theme?: "light" | "dark";
}

const mockVideos: Video[] = [
  {
    id: "1",
    title: "zaafkc",
    thumbnail: "https://images.unsplash.com/photo-1574267432644-f74f8ec55d1f?w=400",
    duration: "0:00",
    url: "https://www.youtube.com/watch?v=0llF08l...",
    addedBy: "malek",
    addedAt: "05/12/2025 21:49:54",
    status: "active"
  },
  {
    id: "2",
    title: "Le Parrain (1972) - Film Complet",
    thumbnail: "https://images.unsplash.com/photo-1758686254041-88d7b6ecee8f?w=400",
    duration: "2:55:00",
    url: "https://youtube.com/watch?v=example1",
    addedBy: "Admin",
    addedAt: "2025-01-15 14:30",
    status: "active"
  },
  {
    id: "3",
    title: "Casablanca (1942) - Classique",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400",
    duration: "1:42:00",
    url: "https://youtube.com/watch?v=example2",
    addedBy: "Admin",
    addedAt: "2025-01-15 15:00",
    status: "active"
  }
];

export function ManageVideosPage({ onBack, theme = "dark" }: ManageVideosPageProps) {
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [searchQuery, setSearchQuery] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddVideo = () => {
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;

    const newVideo: Video = {
      id: Date.now().toString(),
      title: newVideoTitle,
      thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400",
      duration: "0:00",
      url: newVideoUrl,
      addedBy: "Admin",
      addedAt: new Date().toLocaleString("fr-FR"),
      status: "active"
    };

    setVideos([newVideo, ...videos]);
    setNewVideoTitle("");
    setNewVideoUrl("");
    setShowAddForm(false);
  };

  const handleDeleteVideo = (id: string) => {
    setVideos(videos.filter(v => v.id !== id));
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: videos.length,
    active: videos.filter(v => v.status === "active").length,
    error: videos.filter(v => v.status === "pending").length
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-black border-zinc-800' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour au salon</span>
            </button>
            <div className="h-6 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-lg font-semibold`}>
                  Gestion des Vidéos
                </h1>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  Panneau d'administration - {stats.total} vidéos
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Panel - Add Video */}
          <div className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-200'} border rounded-xl p-6 h-fit`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-600/10 rounded">
                <Plus className="w-5 h-5 text-red-600" />
              </div>
              <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-semibold`}>
                Ajouter une Vidéo
              </h2>
            </div>

            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-4`}>
              Ajoutez une nouvelle vidéo à la playlist du salon
            </p>

            <div className="space-y-4">
              <div>
                <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm block mb-2`}>
                  Titre de la vidéo *
                </label>
                <Input
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="Ex: Le Parrain (1972)"
                  className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-black'} h-10`}
                />
              </div>

              <div>
                <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm block mb-2`}>
                  URL de la vidéo *
                </label>
                <Input
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-black'} h-10`}
                />
                <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} text-xs mt-1`}>
                  YouTube, Vimeo, Dailymotion, etc.
                </p>
              </div>

              <Button
                onClick={handleAddVideo}
                disabled={!newVideoTitle.trim() || !newVideoUrl.trim()}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-10 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter la vidéo
              </Button>
            </div>

            <div className={`${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} border rounded-lg p-3 mt-4`}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-blue-500 text-xs">
                  <strong>Astuce :</strong> Les vidéos ajoutées seront immédiatement disponibles pour tous les membres du salon.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-sm font-semibold mb-3`}>
                Statistiques
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Total vidéos</span>
                  <span className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-semibold`}>{stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-500 text-sm">Actives</span>
                  <span className="text-green-500 font-semibold">{stats.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-500 text-sm">En erreur</span>
                  <span className="text-red-500 font-semibold">{stats.error}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Playlist */}
          <div className="col-span-2">
            <div className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-200'} border rounded-xl p-6`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-lg font-semibold`}>
                    Playlist du Salon
                  </h2>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                    {filteredVideos.length} vidéos
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`${theme === 'dark' ? 'border-zinc-700 text-gray-400' : 'border-gray-300 text-gray-600'} h-9`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrer
                </Button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une vidéo..."
                  className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-black'} pl-10 h-10`}
                />
              </div>

              {/* Videos List */}
              <div className="space-y-3">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'} border rounded-lg p-4 flex items-center gap-4`}
                  >
                    {/* Thumbnail */}
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded"
                    />

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-medium mb-1`}>
                            {video.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1">
                              <User className={`w-3 h-3 ${video.addedBy === 'Admin' ? 'text-red-500' : 'text-blue-500'}`} />
                              <span className={video.addedBy === 'Admin' ? 'text-red-500' : 'text-blue-500'}>
                                Ajoutée par {video.addedBy}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {video.addedAt}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${video.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500'} border`}>
                          <Check className="w-3 h-3 mr-1" />
                          {video.status === 'active' ? 'Actif' : 'En attente'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <LinkIcon className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} truncate max-w-xs`}>
                          {video.url}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white h-9 px-4"
                      >
                        <Play className="w-4 h-4 mr-1.5" />
                        Lire
                      </Button>
                      <Button
                        onClick={() => handleDeleteVideo(video.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white h-9 px-4"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
