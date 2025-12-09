import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

import { 
  Plus, 
  Play, 
  Trash2, 
  ArrowLeft, 
  Video, 
  Upload,
  Search,
  Filter,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  addedBy: string;
  status: "active" | "processing" | "error";
  addedAt: string;
}

interface AdminVideoManagementProps {
  roomId: string;
  currentUser: { email: string; name: string } | null;
  onNavigate: (page: string) => void;
  theme: "light" | "dark";
}

const mockVideos: Video[] = [
  {
    id: "1",
    title: "Le Parrain (1972) - Film Complet",
    url: "https://youtube.com/watch?v=example1",
    thumbnail: "https://images.unsplash.com/photo-1758686254041-88d7b6ecee8f?w=400",
    duration: "2:55:00",
    addedBy: "Admin",
    status: "active",
    addedAt: "2025-01-15 14:30"
  },
  {
    id: "2",
    title: "Casablanca (1942) - Classique",
    url: "https://youtube.com/watch?v=example2",
    thumbnail: "https://images.unsplash.com/photo-1758525589589-7376453af030?w=400",
    duration: "1:42:00",
    addedBy: "Admin",
    status: "active",
    addedAt: "2025-01-15 15:00"
  }
];

export function AdminVideoManagement({ 
  roomId, 
  currentUser, 
  onNavigate, 
  theme 
}: AdminVideoManagementProps) {
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) {
      toast.error("Veuillez entrer une URL de vidéo");
      return;
    }

    if (!newVideoTitle.trim()) {
      toast.error("Veuillez entrer un titre pour la vidéo");
      return;
    }

    // Validation URL
    const isValidUrl = newVideoUrl.includes('youtube.com') || 
                       newVideoUrl.includes('youtu.be') || 
                       newVideoUrl.includes('vimeo.com') ||
                       newVideoUrl.includes('dailymotion.com') ||
                       newVideoUrl.startsWith('http');

    if (!isValidUrl) {
      toast.error("Veuillez entrer une URL valide");
      return;
    }

    setIsAdding(true);

    // Simuler un délai de traitement
    setTimeout(() => {
      const newVideo: Video = {
        id: Date.now().toString(),
        title: newVideoTitle,
        url: newVideoUrl,
        thumbnail: "https://images.unsplash.com/photo-1758686254041-88d7b6ecee8f?w=400",
        duration: "0:00",
        addedBy: currentUser?.name || "Admin",
        status: "active",
        addedAt: new Date().toLocaleString('fr-FR')
      };

      setVideos([newVideo, ...videos]);
      setNewVideoUrl("");
      setNewVideoTitle("");
      setIsAdding(false);
      toast.success("✅ Vidéo ajoutée avec succès!");
    }, 1000);
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideos(videos.filter(v => v.id !== videoId));
    toast.success("Vidéo supprimée de la playlist");
  };

  const handlePlayVideo = (video: Video) => {
    toast.success(`Lecture de "${video.title}" pour tous les membres du salon`);
  };

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.addedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-black" : "bg-gray-50"}`}>
      {/* Header */}
      <div className={`${theme === "dark" ? "bg-gradient-to-r from-red-950/40 to-black" : "bg-gradient-to-r from-red-50 to-white"} border-b ${theme === "dark" ? "border-red-900/20" : "border-red-200"}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => onNavigate("room")}
                className={theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-black"}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour au salon
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <h1 className={`text-2xl ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  <Video className="w-6 h-6 inline mr-2 text-red-500" />
                  Gestion des Vidéos
                </h1>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Panneau d'administration - {videos.length} vidéos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Formulaire d'ajout */}
          <div className="lg:col-span-1">
            <Card className={theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-red-500" />
                  Ajouter une Vidéo
                </CardTitle>
                <CardDescription>
                  Ajoutez une nouvelle vidéo à la playlist du salon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="videoTitle" className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                    Titre de la vidéo *
                  </Label>
                  <Input
                    id="videoTitle"
                    type="text"
                    placeholder="Ex: Le Parrain (1972)"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    className={`mt-1 ${theme === "dark" ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white"}`}
                  />
                </div>

                <div>
                  <Label htmlFor="videoUrl" className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                    URL de la vidéo *
                  </Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddVideo()}
                    className={`mt-1 ${theme === "dark" ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white"}`}
                  />
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
                    YouTube, Vimeo, Dailymotion, etc.
                  </p>
                </div>

                <Button
                  onClick={handleAddVideo}
                  disabled={isAdding}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {isAdding ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter la vidéo
                    </>
                  )}
                </Button>

                <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-blue-950/20 border border-blue-900/30" : "bg-blue-50 border border-blue-200"}`}>
                  <p className={`text-sm ${theme === "dark" ? "text-blue-300" : "text-blue-800"}`}>
                    💡 <strong>Astuce :</strong> Les vidéos ajoutées seront immédiatement disponibles pour tous les membres du salon.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card className={`mt-6 ${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white"}`}>
              <CardHeader>
                <CardTitle className="text-lg">Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      Total vidéos
                    </span>
                    <span className={`text-xl ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {videos.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      Actives
                    </span>
                    <span className="text-xl text-green-500">
                      {videos.filter(v => v.status === "active").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      En erreur
                    </span>
                    <span className="text-xl text-red-500">
                      {videos.filter(v => v.status === "error").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des vidéos */}
          <div className="lg:col-span-2">
            <Card className={theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Playlist du Salon</CardTitle>
                    <CardDescription>
                      {filteredVideos.length} vidéo{filteredVideos.length > 1 ? 's' : ''} {searchQuery && "trouvée(s)"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtrer
                    </Button>
                  </div>
                </div>
                
                {/* Barre de recherche */}
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Rechercher une vidéo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-10 ${theme === "dark" ? "bg-zinc-800 border-zinc-700 text-white" : "bg-gray-50"}`}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredVideos.length === 0 ? (
                    <div className="text-center py-12">
                      <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                        {searchQuery ? "Aucune vidéo trouvée" : "Aucune vidéo dans la playlist"}
                      </p>
                      <p className={`text-sm mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                        {!searchQuery && "Ajoutez votre première vidéo ci-contre"}
                      </p>
                    </div>
                  ) : (
                    filteredVideos.map((video) => (
                      <div
                        key={video.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                          theme === "dark" 
                            ? "bg-zinc-800 border-zinc-700 hover:border-red-500/50" 
                            : "bg-white border-gray-200 hover:border-red-400"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = "/assets/placeholder.png")}
                          />

                          <div className="absolute bottom-1 right-1 bg-black/90 text-white text-xs px-2 py-0.5 rounded">
                            {video.duration}
                          </div>

                          {video.status === "active" && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Actif
                            </div>
                          )}

                          {video.status === "error" && (
                            <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Erreur
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-lg mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {video.title}
                          </h3>
                          <div className={`text-sm space-y-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            <p>
                              👤 Ajoutée par <span className="text-red-500">{video.addedBy}</span>
                            </p>
                            <p>
                              🕒 {video.addedAt}
                            </p>
                            <p className="text-xs truncate">
                              🔗 {video.url}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handlePlayVideo(video)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Lire
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVideo(video.id)}
                            className={`${
                              theme === "dark"
                                ? "text-red-400 hover:text-red-300 hover:bg-red-950/30 border-red-900/30"
                                : "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            }`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
