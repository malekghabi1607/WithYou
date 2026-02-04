import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ImageWithFallback } from "../ui/ImageWithFallback";
import { Plus, Play, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  addedBy: string;
}

const mockPlaylist: Video[] = [
  {
    id: "1",
    title: "Le Parrain (1972) - Film Complet",
    url: "https://youtube.com/watch?v=example1",
    thumbnail: "https://images.unsplash.com/photo-1758686254041-88d7b6ecee8f?w=400",
    duration: "2:55:00",
    addedBy: "CinePhile"
  },
  {
    id: "2",
    title: "Casablanca (1942) - Classique",
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

interface RoomPlaylistSettingsProps {
  roomId: string;
}

export function RoomPlaylistSettings({ roomId }: RoomPlaylistSettingsProps) {
  const [playlist, setPlaylist] = useState<Video[]>(mockPlaylist);
  const [newVideoUrl, setNewVideoUrl] = useState("");

  const handleAddVideo = () => {
    console.log("Tentative d&apos;ajout de vidéo:", newVideoUrl);
    
    if (!newVideoUrl.trim()) {
      toast.error("Veuillez entrer une URL de vidéo");
      return;
    }

    // Validation plus souple - accepte YouTube et autres plateformes
    const isValidUrl = newVideoUrl.includes('youtube.com') || 
                       newVideoUrl.includes('youtu.be') || 
                       newVideoUrl.includes('vimeo.com') ||
                       newVideoUrl.includes('dailymotion.com') ||
                       newVideoUrl.startsWith('http');

    if (!isValidUrl) {
      toast.error("Veuillez entrer une URL valide");
      return;
    }

    const newVideo: Video = {
      id: Date.now().toString(),
      title: "Nouvelle vidéo - " + new Date().toLocaleTimeString(),
      url: newVideoUrl,
      thumbnail: "https://images.unsplash.com/photo-1758686254041-88d7b6ecee8f?w=400",
      duration: "0:00",
      addedBy: "Vous"
    };

    console.log("Ajout de la vidéo:", newVideo);
    setPlaylist([...playlist, newVideo]);
    setNewVideoUrl("");
    toast.success("✅ Vidéo ajoutée à la playlist!");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddVideo();
    }
  };

  const handleDeleteVideo = (videoId: string) => {
    setPlaylist(playlist.filter(v => v.id !== videoId));
    toast.success("Vidéo supprimée de la playlist");
  };

  const handlePlayVideo = (videoTitle: string) => {
    toast.success(`Lecture de "${videoTitle}" pour tous les membres`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion de la playlist</CardTitle>
        <CardDescription>
          Ajoutez et gérez les vidéos de votre salon ({playlist.length} vidéos)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add Video */}
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg">
          <Label htmlFor="videoUrl" className="mb-2 block text-red-900">
            🎬 Ajouter une vidéo (YouTube, Vimeo, etc.)
          </Label>
          <div className="flex gap-2">
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://www.youtube.com/watch?v=... ou autre URL"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleAddVideo}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            💡 Appuyez sur Entrée ou cliquez sur Ajouter
          </p>
        </div>

        {/* Playlist */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            📋 Playlist ({playlist.length} vidéos)
          </h3>
          {playlist.map((video, index) => (
            <div
              key={video.id}
              className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-red-400 hover:shadow-md transition-all"
            >
              <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
              
              <div className="relative w-32 h-20 flex-shrink-0">
                <ImageWithFallback
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                  {video.duration}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm truncate">{video.title}</h4>
                <p className="text-xs text-gray-500">
                  Ajoutée par {video.addedBy}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePlayVideo(video.title)}
                  className="hover:bg-green-50 hover:border-green-500 hover:text-green-600"
                  title="Lire cette vidéo"
                >
                  <Play className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteVideo(video.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-500"
                  title="Supprimer cette vidéo"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {playlist.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Aucune vidéo dans la playlist</p>
            <p className="text-sm mt-2">Ajoutez votre première vidéo ci-dessus</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Astuce :</strong> Vous pouvez réorganiser les vidéos en les 
            glissant-déposant avec l&apos;icône ⋮⋮
          </p>
        </div>
      </CardContent>
    </Card>
  );
}