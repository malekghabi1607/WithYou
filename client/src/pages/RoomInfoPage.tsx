/**
 * Projet : WithYou
 * Fichier : pages/RoomInfoPage.tsx
 *
 * Description :
 * Page d’informations d’un salon.
 *
 * Elle affiche les détails principaux du salon
 * (nom, description, créateur, participants, type public/privé)
 * et permet à l’utilisateur de rejoindre le salon.
 *
 * Selon la situation :
 *  - l’utilisateur est redirigé vers la connexion s’il n’est pas connecté
 *  - un code est demandé si le salon est privé
 *  - l’accès est direct si le salon est public
 */


import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Header } from "../components/layouts/Header";
import { Footer } from "../components/layouts/Footer";

import { Video, Users, Lock, Globe, Star, Crown, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchSalonByCode, joinSalon } from "../api/rooms";

interface RoomInfoPageProps {
  roomId: string;
  currentUser: { email: string; name: string } | null;
  onNavigate: (page: string, roomId?: string) => void;
  onJoinRoom: (roomId: string) => void;
  theme?: "light" | "dark";
}

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1080";

export function RoomInfoPage({ roomId, currentUser, onNavigate, onJoinRoom, theme = "dark" }: RoomInfoPageProps) {
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSalonByCode(roomId);
        setRoom({
          id: data.room_code,
          name: data.name,
          description: data.description || "Aucune description",
          creator: "Admin",
          participants: 0,
          maxParticipants: data.max_participants || 20,
          isPublic: !!data.is_public,
          currentVideo: "Aucune vidéo",
          thumbnail: DEFAULT_THUMBNAIL,
          createdAt: "Aujourd'hui",
          tags: ["Salon", "Public"],
          rating: 0,
        });
      } catch (error) {
        console.error("Erreur chargement salon", error);
      }
    };

    load();
  }, [roomId]);

  if (!room) return null;

  const handleJoin = async () => {
    if (!currentUser) {
      onNavigate('signin');
      return;
    }

    if (!room.isPublic) {
      onNavigate('join-with-code', roomId);
      return;
    }

    try {
      await joinSalon(roomId);
    } catch (error) {
      console.error("Erreur enregistrement adhésion salon", error);
    }

    onJoinRoom(roomId);
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      <Header 
        currentUser={currentUser}
        currentPage="room-info"
        onNavigate={onNavigate}
        theme={theme}
      />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-red-900/20">
              <img
                src={room.thumbnail}
                alt={room.name}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              
              {/* Live Badge */}
              <Badge className="absolute top-4 right-4 bg-red-600">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                En direct
              </Badge>

              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg shadow-red-600/50">
                  <Play className="w-10 h-10 text-white fill-white ml-1" />
                </div>
              </div>

              {/* Current Video */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-sm text-gray-300 mb-1">En cours de lecture</p>
                <p className="text-white text-lg">{room.currentVideo}</p>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h1 className={`text-4xl md:text-5xl mb-4 font-display ${theme === "dark" ? "text-white" : "text-black"}`}>
                  {room.name}
                </h1>
                <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {room.description}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Users className="w-8 h-8 text-red-500" />
                    <div>
                      <div className={`text-2xl font-display ${theme === "dark" ? "text-white" : "text-black"}`}>
                        {room.participants}/{room.maxParticipants}
                      </div>
                      <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        Participants
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                    <div>
                      <div className={`text-2xl font-display ${theme === "dark" ? "text-white" : "text-black"}`}>
                        {room.rating}
                      </div>
                      <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        Note moyenne
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Creator & Type */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                    Créé par <span className={`${theme === "dark" ? "text-white" : "text-black"}`}>{room.creator}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {room.isPublic ? (
                    <>
                      <Globe className="w-5 h-5 text-green-500" />
                      <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                        Salon public
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 text-orange-500" />
                      <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                        Salon privé
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-500" />
                  <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                    Créé {room.createdAt}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {room.tags.map((tag, index) => (
                  <Badge key={index} className={`${theme === "dark" ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600"}`}>
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Join Button */}
              <Button
                onClick={handleJoin}
                size="lg"
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white text-lg shadow-lg shadow-red-600/50"
              >
                {currentUser ? "Rejoindre le salon" : "Se connecter pour rejoindre"}
              </Button>

              {!currentUser && (
                <p className={`text-center text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Vous devez être connecté pour rejoindre un salon
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} theme={theme} />
    </div>
  );
}
