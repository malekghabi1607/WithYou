/**
 * Projet : WithYou
 * Fichier : pages/SalonsPage.tsx
 *
 * Description :
 * Page principale de gestion des salons.
 *
 * Elle permet à l’utilisateur :
 *  - de créer un nouveau salon de visionnage collaboratif
 *  - de rejoindre un salon existant via un code
 *  - d’accéder à la liste des salons publics
 *
 * L’interface repose sur des composants UI réutilisables
 * (Card, Button, Header, Footer) afin de garantir
 * une structure claire et cohérente.
 *
 * Cette page s’intègre dans la navigation globale de l’application
 * et respecte les thèmes clair et sombre.
 *
 * Utilisée dans routes/AppRouter.tsx pour l’accès aux fonctionnalités
 * liées aux salons.
 */
import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Plus, DoorOpen, Play } from "lucide-react";
import { Header } from "../components/layouts/Header";
import { Footer } from "../components/layouts/Footer";
import { fetchMySalons, listSalons } from "../api/rooms";

interface SalonsPageProps {
  onNavigate: (page: string) => void;
  currentUser: { email: string; name: string } | null;
  onLogout: () => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function SalonsPage({
  onNavigate,
  currentUser,
  onLogout,
  theme = "dark",
  onThemeToggle
}: SalonsPageProps) {
  const [mySalons, setMySalons] = useState<any[]>([]);
  const [allSalons, setAllSalons] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser) {
      fetchMySalons().then(res => {
        if (res.salons) setMySalons(res.salons);
      });
      listSalons().then((res) => setAllSalons(res || []));
    }
  }, [currentUser]);

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
      <Header
        currentUser={currentUser}
        currentPage="salons"
        onNavigate={onNavigate}
        onLogout={onLogout}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl mb-4">Salons</h1>
            <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Créez votre propre salon ou rejoignez-en un existant
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Créer un salon */}
            <Card
              className={`${theme === "dark"
                ? "bg-gradient-to-br from-red-950/30 to-black border-red-900/30 hover:border-red-700/50"
                : "bg-gradient-to-br from-red-50 to-white border-red-200 hover:border-red-400"
                } transition-all duration-300 cursor-pointer group`}
              onClick={() => onNavigate("create-room")}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto w-20 h-20 rounded-full ${theme === "dark" ? "bg-red-900/30" : "bg-red-100"
                  } flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Plus className={`w-10 h-10 ${theme === "dark" ? "text-red-500" : "text-red-600"}`} />
                </div>
                <CardTitle className="text-2xl">Créer un salon</CardTitle>
                <CardDescription className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Créez votre propre espace pour regarder des vidéos avec vos amis
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  className={`w-full ${theme === "dark"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-600 hover:bg-red-700"
                    } text-white`}
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate("create-room");
                  }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer maintenant
                </Button>
              </CardContent>
            </Card>

            {/* Rejoindre un salon */}
            <Card
              className={`${theme === "dark"
                ? "bg-gradient-to-br from-blue-950/30 to-black border-blue-900/30 hover:border-blue-700/50"
                : "bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:border-blue-400"
                } transition-all duration-300 cursor-pointer group`}
              onClick={() => onNavigate("join-room")}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto w-20 h-20 rounded-full ${theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"
                  } flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <DoorOpen className={`w-10 h-10 ${theme === "dark" ? "text-blue-500" : "text-blue-600"}`} />
                </div>
                <CardTitle className="text-2xl">Rejoindre un salon</CardTitle>
                <CardDescription className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Entrez un code d'invitation pour rejoindre un salon existant
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  className={`w-full ${theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate("join-room");
                  }}
                >
                  <DoorOpen className="w-5 h-5 mr-2" />
                  Rejoindre maintenant
                </Button>
              </CardContent>
            </Card>
          </div>


          {/* Mes Salons */}
          {mySalons.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl mb-6 pl-2 border-l-4 border-red-600">Vos Salons</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mySalons.map((salon) => (
                  <Card key={salon.id_salon} className={`${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white"} transition-all hover:scale-[1.02]`}>
                    <CardHeader>
                      <CardTitle className="truncate">{salon.name}</CardTitle>
                      <CardDescription className="line-clamp-1 text-xs font-mono">CODE: {salon.id_salon}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => onNavigate("room", { roomId: salon.id_salon })}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Rejoindre
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Salons publics */}
          <div className="mt-12">
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-gray-50 border-gray-200"}>
              <CardHeader>
                <CardTitle>Salons publics</CardTitle>
                <CardDescription className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Découvrez les salons publics disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className={`w-full ${theme === "dark"
                    ? "border-gray-700 hover:bg-gray-800"
                    : "border-gray-300 hover:bg-gray-100"
                    }`}
                  onClick={() => onNavigate("public-rooms")}
                >
                  Voir tous les salons publics
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tous les salons */}
          {allSalons.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl mb-6 pl-2 border-l-4 border-blue-600">Tous les salons</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allSalons.map((salon) => (
                  <Card
                    key={salon.id_salon}
                    className={`${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white"} transition-all hover:scale-[1.02]`}
                  >
                    <CardHeader>
                      <CardTitle className="truncate">{salon.name}</CardTitle>
                      <CardDescription className="line-clamp-1 text-xs">
                        {salon.is_public ? "Public" : "Privé"} | {salon.video_count || 0} vidéo(s) | {salon.participants_count || 0} participant(s)
                      </CardDescription>
                      <CardDescription className="line-clamp-1 text-xs">
                        Playlist: {salon.has_playlist ? "Oui" : "Non"} | Hôte: {salon.owner_name?.username || "Inconnu"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => onNavigate("join-room")}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Rejoindre
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={onNavigate} theme={theme} />
    </div>
  );
}
