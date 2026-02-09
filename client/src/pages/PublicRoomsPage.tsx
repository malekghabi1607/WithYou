
/**
 * Projet : WithYou
 * Fichier : pages/PublicRoomsPage.tsx
 *
 * Description :
 * Page d’exploration des salons publics disponibles.
 *
 * Elle permet à l’utilisateur :
 *  - de consulter la liste des salons publics actifs
 *  - de rechercher un salon par nom ou description
 *  - de visualiser les informations principales d’un salon
 *    (participants, vidéo en cours, hôte, note)
 *  - d’accéder à un salon via la page d’informations
 *  - de créer ou rejoindre un salon depuis des actions rapides
 *
 * Les salons affichés combinent des données simulées
 * et des salons sauvegardés dans le localStorage.
 *
 * Cette page utilise des composants UI réutilisables
 * (Card, Badge, Button, Input, Header, Footer)
 * et respecte les thèmes clair et sombre.
 *
 * Elle s’intègre dans le système de navigation global
 * via le routeur de l’application.
 */

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Header } from "../components/layouts/Header";
import { Footer } from "../components/layouts/Footer";
import {
  Search,
  Users,
  Plus,
  Crown,
  Globe,
  Play,
  Star,
  TrendingUp
} from "lucide-react";
import { listSalons } from "../api/rooms";

interface Room {
  id: string;
  name: string;
  description: string;
  participants: number;
  videosCount: number;
  maxParticipants: number;
  isPublic: boolean;
  currentVideo: string;
  host: string;
  thumbnail: string;
  rating: number;
}

interface PublicRoomsPageProps {
  onNavigate: (page: string, data?: any) => void;
  currentUser: { email: string; name: string } | null;
  onSignOut: () => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400";

export function PublicRoomsPage({ onNavigate, currentUser, onSignOut, theme = "dark", onThemeToggle }: PublicRoomsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allRooms, setAllRooms] = useState<Room[]>([]);

  // Charger depuis l'API
  useEffect(() => {
    const load = async () => {
      try {
        const data = await listSalons();
        const mapped = (data || [])
          .filter((room: any) => !!room.is_public)
          .map((room: any) => ({
            id: room.id_salon,
            name: room.name || "Salon sans nom",
            description: room.description || "Aucune description",
            participants: room.participants_count || 0,
            videosCount: room.video_count || 0,
            maxParticipants: room.max_participants || 20,
            isPublic: !!room.is_public,
            currentVideo: room.current_video_title || "Aucune vidéo",
            host: room.owner_name?.username || "Administrateur",
            thumbnail: DEFAULT_THUMBNAIL,
            rating: 0,
          }));
        setAllRooms(mapped);
      } catch (error) {
        console.error("Erreur chargement salons", error);
      }
    };

    load();
  }, []);

  const filteredRooms = allRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      <Header
        currentUser={currentUser}
        currentPage="public-rooms"
        onNavigate={onNavigate}
        onLogout={onSignOut}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className={`mb-8 p-8 rounded-2xl ${theme === "dark" ? "bg-gradient-to-r from-red-900/20 to-black" : "bg-gradient-to-r from-red-100 to-white"} border ${theme === "dark" ? "border-red-900/20" : "border-red-200"}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h1 className={`text-4xl mb-2 font-display ${theme === "dark" ? "text-white" : "text-black"}`}>
                  SALONS PUBLICS
                </h1>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Rejoignez des milliers d'utilisateurs qui regardent ensemble
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => onNavigate("join-room")}
                  size="lg"
                  variant="outline"
                  className={`${theme === "dark" ? "border-red-600 text-red-500 hover:bg-red-950/30" : "border-red-600 text-red-600 hover:bg-red-50"}`}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Rejoindre un salon
                </Button>
                <Button
                  onClick={() => onNavigate("create-room")}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/50"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer un salon
                </Button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              <Input
                type="text"
                placeholder="Rechercher un salon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-12 h-14 text-lg ${theme === "dark" ? "bg-zinc-900 border-red-900/20 text-white placeholder:text-gray-500" : "bg-white border-gray-300 text-black placeholder:text-gray-400"} focus:border-red-600`}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}`}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <div className={`text-2xl font-display ${theme === "dark" ? "text-white" : "text-black"}`}>{allRooms.length}</div>
                  <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Salons actifs</div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}`}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <div className={`text-2xl font-display ${theme === "dark" ? "text-white" : "text-black"}`}>
                    {allRooms.reduce((acc, room) => acc + room.participants, 0)}
                  </div>
                  <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Spectateurs</div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}`}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <div className={`text-2xl font-display ${theme === "dark" ? "text-white" : "text-black"}`}>
                    {allRooms.filter(r => r.participants > 0).length}
                  </div>
                  <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>En direct</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card
                key={room.id}
                className={`group overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 ${theme === "dark"
                  ? "bg-zinc-900 border-red-900/20 hover:border-red-600"
                  : "bg-white border-gray-200 hover:border-red-600"
                  } shadow-lg hover:shadow-xl hover:shadow-red-600/20`}
                onClick={() => onNavigate("room-info", { roomId: room.id })}
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={room.thumbnail}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                  {/* Live Badge */}
                  <Badge className="absolute top-3 right-3 bg-red-600">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                    En direct
                  </Badge>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/50">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Room Name */}
                  <h3 className={`text-xl mb-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
                    {room.name}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm mb-4 line-clamp-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {room.description}
                  </p>

                  {/* Current Video */}
                  <div className={`flex items-center gap-2 mb-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    <Play className="w-4 h-4 text-red-500" />
                    <span className="truncate">{room.currentVideo}</span>
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-red-900/20">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-red-500" />
                        <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                          {room.participants}/{room.maxParticipants}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Play className="w-4 h-4 text-red-500" />
                        <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                          {room.videosCount} vidéo(s)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                          {room.rating}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {room.host}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-16">
              <Search className={`w-16 h-16 mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
              <p className={`text-xl ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Aucun salon trouvé
              </p>
              <p className={`${theme === "dark" ? "text-gray-500" : "text-gray-500"} mt-2`}>
                Essayez une autre recherche
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={onNavigate} theme={theme} />
    </div>
  );
}
