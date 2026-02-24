import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Header } from "../components/layouts/Header";
import { Footer } from "../components/layouts/Footer";
import {
  User,
  Mail,
  Calendar,
  Crown,
  Users,
  Video,
  Settings,
  Edit,
  Save,
  X,
  Lock,
  Globe,
  Star,
  Heart,
  Play,
  Trash2,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { fetchMySalons } from "../api/rooms";
import { fetchFavorites, removeFavorite } from "../api/favorites";
import { updateProfile } from "../api/auth";

interface ProfilePageProps {
  currentUser: { email: string; name: string; memberSince?: string; id?: string };
  onNavigate: (page: string, data?: any) => void;
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
  theme?: "light" | "dark";
}

interface Room {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  role: "admin" | "member";
  members: number;
  lastActive: string;
  thumbnail: string;
}

interface FavoriteVideo {
  id: string;
  title: string;
  thumbnail: string;
  addedAt: string;
}

const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400";

export function ProfilePage({ currentUser, onNavigate, onLogout, onUserUpdate, theme = "dark" }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name);
  const [favorites, setFavorites] = useState<FavoriteVideo[]>([]);
  const [userRooms, setUserRooms] = useState<Room[]>([]);

  // Load user's rooms and favorites from API
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await fetchMySalons();
        const owned = (data.owned || data.salons || []).map((room: any) => ({
          id: room.id_salon,
          name: room.name,
          description: room.description || "Aucune description",
          isPublic: !!room.is_public,
          role: "admin" as const,
          members: 0,
          lastActive: "En ligne",
          thumbnail: DEFAULT_THUMBNAIL,
        }));

        const joined = (data.joined || []).map((room: any) => ({
          id: room.id_salon,
          name: room.name,
          description: room.description || "Aucune description",
          isPublic: !!room.is_public,
          role: "member" as const,
          members: 0,
          lastActive: "En ligne",
          thumbnail: DEFAULT_THUMBNAIL,
        }));

        const dedupedById = new Map<string, Room>();
        [...owned, ...joined].forEach((room) => dedupedById.set(room.id, room));
        setUserRooms(Array.from(dedupedById.values()));
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error("Erreur chargement salons profil", error);
        const message = String(error?.message || "");
        if (message.includes("(401)")) {
          toast.error("Session expirée, reconnecte-toi.");
          onLogout();
        }
      }
    };
    const loadFavorites = async () => {
      try {
        const data = await fetchFavorites();
        const mapped = (data || []).map((fav: any) => ({
          id: fav.youtube_id,
          title: fav.title,
          thumbnail: fav.thumbnail || DEFAULT_THUMBNAIL,
          addedAt: fav.added_at ? new Date(fav.added_at).toLocaleDateString("fr-FR") : "Récemment",
        }));
        setFavorites(mapped);
      } catch (error: any) {
        console.error("Erreur chargement favoris", error);
        const message = String(error?.message || "");
        if (message.includes("(401)")) {
          toast.error("Session expirée, reconnecte-toi.");
          onLogout();
        }
      }
    };

    loadRooms();
    loadFavorites();
  }, [currentUser.email]);

  const handleSave = async () => {
    try {
      if (!editedName.trim()) return;

      await updateProfile({ username: editedName });

      // Update local state immediately
      const updatedUser = {
        ...currentUser,
        name: editedName,
        username: editedName
      };

      onUserUpdate(updatedUser);

      toast.success("Profil mis à jour !");
      setIsEditing(false);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error("Erreur mise à jour profil", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    try {
      await removeFavorite(id);
      setFavorites(prev => prev.filter(f => f.id !== id));
      toast.success("Vidéo retirée des favoris");
    } catch (error) {
      console.error("Erreur suppression favori", error);
      toast.error("Impossible de retirer le favori");
    }
  };

  const createdRooms = userRooms.filter(r => r.role === "admin");
  const joinedRooms = userRooms.filter(r => r.role === "member");

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      <Header
        currentUser={currentUser}
        currentPage="profile"
        onNavigate={onNavigate} onLogout={onLogout}
        theme={theme}
      />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Profile Header */}
          <Card className={`mb-8 ${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}`}>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-4xl">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className={theme === "dark" ? "bg-zinc-800 border-red-900/30 text-white" : "bg-white border-gray-300"}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSave}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          size="sm"
                          variant="outline"
                          className={theme === "dark" ? "border-red-900/30" : "border-gray-300"}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className={`text-3xl font-display mb-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
                        {currentUser.name}
                      </h1>
                      <div className={`flex flex-wrap gap-4 justify-center md:justify-start ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-red-500" />
                          <span>{currentUser.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-red-500" />
                          <span>{`Membre depuis ${currentUser.memberSince ?? "—"}`}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className={theme === "dark" ? "border-red-900/30 text-red-400 hover:bg-red-900/20" : "border-gray-300 hover:bg-gray-100"}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                    <Crown className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-display ${theme === "dark" ? "text-white" : "text-black"}`}>
                      {createdRooms.length}
                    </div>
                    <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Salons créés
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-display ${theme === "dark" ? "text-white" : "text-black"}`}>
                      {joinedRooms.length}
                    </div>
                    <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Salons rejoints
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <div className={`text-2xl font-display ${theme === "dark" ? "text-white" : "text-black"}`}>
                      {favorites.length}
                    </div>
                    <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Vidéos favorites
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mes Salons */}
          <div className="mb-8">
            <h2 className={`text-2xl font-display mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
              MES SALONS
            </h2>

            {/* Created Rooms */}
            <h3 className={`text-lg mb-3 flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              <Crown className="w-5 h-5 text-yellow-500" />
              Créés par moi ({createdRooms.length})
            </h3>
            {createdRooms.length === 0 ? (
              <div className={`p-8 rounded-lg ${theme === "dark" ? "bg-zinc-900 border border-red-900/20" : "bg-gray-50 border border-gray-200"} mb-6 text-center`}>
                <Crown className={`w-12 h-12 mx-auto mb-3 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
                <p className={`mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Vous n'avez pas encore créé de salon
                </p>
                <Button
                  onClick={() => onNavigate("create-room")}
                  className="bg-red-600 hover:bg-red-700 text-white mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon premier salon
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {createdRooms.map((room) => (
                  <Card
                    key={room.id}
                    className={`cursor-pointer hover:scale-105 transition-transform ${theme === "dark"
                      ? "bg-zinc-900 border-red-900/20 hover:border-red-600"
                      : "bg-white border-gray-200 hover:border-red-600"
                      }`}
                    onClick={() => onNavigate("room", { roomId: room.id })}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={room.thumbnail}
                          alt={room.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className={`mb-1 ${theme === "dark" ? "text-white" : "text-black"}`}>
                            {room.name}
                          </h4>
                          <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {room.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs">
                            <Badge className="bg-red-600">
                              <Crown className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                            <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                              <Users className="w-3 h-3 inline mr-1" />
                              {room.members}
                            </span>
                            {room.isPublic ? (
                              <Globe className="w-3 h-3 text-green-500" />
                            ) : (
                              <Lock className="w-3 h-3 text-orange-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Joined Rooms */}
            <h3 className={`text-lg mb-3 flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              <Users className="w-5 h-5 text-blue-500" />
              Rejoints ({joinedRooms.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {joinedRooms.map((room) => (
                <Card
                  key={room.id}
                  className={`cursor-pointer hover:scale-105 transition-transform ${theme === "dark"
                    ? "bg-zinc-900 border-red-900/20 hover:border-red-600"
                    : "bg-white border-gray-200 hover:border-red-600"
                    }`}
                  onClick={() => onNavigate("room", { roomId: room.id })}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={room.thumbnail}
                        alt={room.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className={`mb-1 ${theme === "dark" ? "text-white" : "text-black"}`}>
                          {room.name}
                        </h4>
                        <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {room.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <Badge className="bg-blue-600">Membre</Badge>
                          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                            <Users className="w-3 h-3 inline mr-1" />
                            {room.members}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Favoris */}
          <div>
            <h2 className={`text-2xl font-display mb-4 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              MES FAVORIS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map((video) => (
                <Card
                  key={video.id}
                  className={`group cursor-pointer ${theme === "dark"
                    ? "bg-zinc-900 border-red-900/20 hover:border-red-600"
                    : "bg-white border-gray-200 hover:border-red-600"
                    } transition-all`}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(video.id);
                        }}
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-3">
                      <p className={`text-sm line-clamp-2 mb-1 ${theme === "dark" ? "text-white" : "text-black"}`}>
                        {video.title}
                      </p>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {video.addedAt}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} onLogout={onLogout} theme={theme} />
    </div>
  );
}
