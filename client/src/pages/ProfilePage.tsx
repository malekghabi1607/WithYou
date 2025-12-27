import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
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
import { getRooms, getFavorites } from "../utils/storage";

interface ProfilePageProps {
  currentUser: { email: string; name: string };
  onNavigate: (page: string, data?: any) => void;
  onLogout: () => void;
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

const mockUserRooms: Room[] = [
  {
    id: "1",
    name: "🎬 Soirée Cinéma Classique",
    description: "Films classiques et discussions",
    isPublic: true,
    role: "admin",
    members: 8,
    lastActive: "Il y a 5 min",
    thumbnail: "https://images.unsplash.com/photo-1758686254041-88d7b6ecee8f?w=400"
  },
  {
    id: "2",
    name: "🎮 Gaming Sessions",
    description: "Streams gaming ensemble",
    isPublic: true,
    role: "member",
    members: 15,
    lastActive: "Il y a 2h",
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400"
  }
];

const mockFavorites: FavoriteVideo[] = [
  {
    id: "1",
    title: "Le Parrain (1972)",
    thumbnail: "https://images.unsplash.com/photo-1758686254041-88d7b6ecee8f?w=300",
    addedAt: "Il y a 2 jours"
  },
  {
    id: "2",
    title: "Pulp Fiction (1994)",
    thumbnail: "https://images.unsplash.com/photo-1574267432644-f74f8ec55d1f?w=300",
    addedAt: "Il y a 5 jours"
  },
  {
    id: "3",
    title: "Inception (2010)",
    thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300",
    addedAt: "Il y a 1 semaine"
  }
];

export function ProfilePage({ currentUser, onNavigate, onLogout, theme = "dark" }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name);
  const [favorites, setFavorites] = useState(mockFavorites);
  const [userRooms, setUserRooms] = useState<Room[]>(mockUserRooms);

  // Load user's rooms and favorites from localStorage
  useEffect(() => {
    const allRooms = getRooms();
    const savedFavorites = getFavorites(currentUser.email);
    
    // Map saved rooms to profile format, determining role based on creatorEmail
    const mappedRooms: Room[] = allRooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      isPublic: room.isPublic,
      role: room.creatorEmail === currentUser.email ? "admin" : "member",
      members: room.participants,
      lastActive: "En ligne",
      thumbnail: room.thumbnail
    }));

    // Combine mock rooms with real saved rooms (avoid duplicates)
    const combinedRooms = [...mockUserRooms];
    mappedRooms.forEach(room => {
      if (!combinedRooms.find(r => r.id === room.id)) {
        combinedRooms.push(room);
      }
    });
    setUserRooms(combinedRooms);
    
    // Load favorites
    if (savedFavorites.length > 0) {
      const combinedFavorites = [...mockFavorites];
      savedFavorites.forEach(fav => {
        if (!combinedFavorites.find(f => f.id === fav.id)) {
          combinedFavorites.push({
            id: fav.id,
            title: fav.title,
            thumbnail: fav.thumbnail,
            addedAt: fav.addedAt
          });
        }
      });
      setFavorites(combinedFavorites);
    }
  }, [currentUser.email]);

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profil mis à jour !");
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
    toast.success("Vidéo retirée des favoris");
  };

  const createdRooms = userRooms.filter(r => r.role === "admin");
  const joinedRooms = userRooms.filter(r => r.role === "member");

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      <Header 
        currentUser={currentUser}
        currentPage="profile"
        onNavigate={onNavigate}
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
                          <span>Membre depuis 2024</span>
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
                      {mockUserRooms.length}
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
                  className={`cursor-pointer hover:scale-105 transition-transform ${
                    theme === "dark" 
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
                  className={`cursor-pointer hover:scale-105 transition-transform ${
                    theme === "dark" 
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
                  className={`group cursor-pointer ${
                    theme === "dark" 
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

      <Footer onNavigate={onNavigate} theme={theme} />
    </div>
  );
}