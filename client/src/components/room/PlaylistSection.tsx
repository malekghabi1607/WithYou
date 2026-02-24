


/**
 * Projet : WithYou
 * Fichier : components/room/PlaylistSection.tsx
 *
 * Description :
 * Composant responsable de l’affichage et de la gestion de la playlist
 * d’un salon de visionnage collaboratif.
 *
 * Fonctionnalités principales :
 * - Affichage de la liste des vidéos du salon
 * - Recherche de vidéos par titre
 * - Lecture d’une vidéo (réservée à l’administrateur)
 * - Ajout et suppression de vidéos (administrateur uniquement)
 * - Gestion des vidéos favorites
 * - Mise en évidence de la vidéo actuellement en cours de lecture
 *
 * Objectif :
 * - Permettre une navigation fluide dans la playlist
 * - Donner à l’administrateur le contrôle du contenu vidéo
 * - Améliorer l’expérience utilisateur pendant le visionnage collectif
 *
 * Remarque :
 * - Les données sont simulées (mock) pour le développement front-end
 * - Les actions affichent des notifications via Sonner
 */

import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/badge";

import { 
  Play, 
  Plus, 
  Trash2, 
  Star,
  Search,
  X
} from "lucide-react";
import { toast } from "sonner";

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  addedBy: string;
  isFavorite?: boolean;
}

interface PlaylistSectionProps {
  isAdmin: boolean;
  currentVideo: string;
  onPlayVideo: (videoId: string) => void;
}

const mockPlaylist: Video[] = [
  {
    id: "1",
    title: "Le Parrain (1972)",
    url: "https://youtube.com/watch?v=sY1S34973zA",
    thumbnail: "https://images.unsplash.com/photo-1758686254041-88d7b6ecee8f?w=400",
    duration: "2:55:00",
    addedBy: "CinePhile"
  },
  {
    id: "2",
    title: "Casablanca (1942)",
    url: "https://youtube.com/watch?v=example2",
    thumbnail: "https://images.unsplash.com/photo-1758525589589-7376453af030?w=400",
    duration: "1:42:00",
    addedBy: "MovieFan"
  },
  {
    id: "3",
    title: "Citizen Kane (1941)",
    url: "https://youtube.com/watch?v=example3",
    thumbnail: "https://images.unsplash.com/photo-1561204652-a501fe30a82e?w=400",
    duration: "1:59:00",
    addedBy: "CinePhile"
  }
];

export function PlaylistSection({ isAdmin, currentVideo, onPlayVideo }: PlaylistSectionProps) {
  const [playlist, setPlaylist] = useState<Video[]>(mockPlaylist);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");

  const filteredPlaylist = playlist.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) {
      toast.error("Veuillez entrer une URL YouTube");
      return;
    }

    if (!newVideoUrl.includes('youtube.com') && !newVideoUrl.includes('youtu.be')) {
      toast.error("URL YouTube invalide");
      return;
    }

    const newVideo: Video = {
      id: Date.now().toString(),
      title: "Nouvelle vidéo",
      url: newVideoUrl,
      thumbnail: "https://images.unsplash.com/photo-1758686254041-88d7b6ecee8f?w=400",
      duration: "0:00",
      addedBy: "Vous"
    };

    setPlaylist([...playlist, newVideo]);
    setNewVideoUrl("");
    setShowAddForm(false);
    toast.success("Vidéo ajoutée à la playlist");
  };

  const handleDeleteVideo = (videoId: string) => {
    setPlaylist(playlist.filter(v => v.id !== videoId));
    toast.success("Vidéo supprimée");
  };

  const handleToggleFavorite = (videoId: string) => {
    setPlaylist(playlist.map(v => 
      v.id === videoId ? { ...v, isFavorite: !v.isFavorite } : v
    ));
    const video = playlist.find(v => v.id === videoId);
    toast.success(video?.isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white">Playlist</h3>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-900 border-gray-700 text-white text-sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Add Form */}
        {showAddForm && isAdmin && (
          <div className="p-3 bg-gray-900 border border-purple-500 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm">Ajouter une vidéo</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="URL YouTube..."
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white text-sm"
              />
              <Button size="sm" onClick={handleAddVideo}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Playlist */}
        {filteredPlaylist.map((video) => {
          const isCurrent = video.id === currentVideo;

          return (
            <div
              key={video.id}
              className={`group p-2 rounded-lg transition-all ${
                isCurrent 
                  ? "bg-purple-900/50 border-2 border-purple-500" 
                  : "bg-gray-900 hover:bg-gray-850"
              }`}
            >
              <div className="flex gap-2">
                {/* Thumbnail */}
                  <div className="relative w-24 h-16 flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover rounded"
                    />

                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                    {video.duration}
                  </div>
                  {isCurrent && (
                    <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center rounded">
                      <Badge className="bg-purple-600 text-xs">En cours</Badge>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm truncate">{video.title}</h4>
                  <p className="text-xs text-gray-400 truncate">Par {video.addedBy}</p>

                  {/* Actions */}
                  <div className="flex gap-1 mt-1">
                    {isAdmin && !isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPlayVideo(video.id)}
                        className="h-6 px-2 text-xs"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(video.id)}
                      className={`h-6 px-2 text-xs ${video.isFavorite ? 'text-yellow-500' : ''}`}
                    >
                      <Star className={`w-3 h-3 ${video.isFavorite ? 'fill-yellow-500' : ''}`} />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVideo(video.id)}
                        className="h-6 px-2 text-xs text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPlaylist.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Aucune vidéo trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
