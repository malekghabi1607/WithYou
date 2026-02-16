/**
 * Projet : WithYou
 * Fichier : pages/JoinRoomPage.tsx
 *
 * Description :
 * Page permettant à un utilisateur de rejoindre un salon existant
 * à l’aide d’un code d’invitation.
 *
 * Cette page gère :
 *  - la saisie et la validation du code du salon
 *  - la recherche simulée d’un salon correspondant au code
 *  - l’affichage des informations du salon trouvé
 *    (nom, description, hôte, participants, visibilité)
 *  - la gestion des salons privés protégés par mot de passe
 *  - la connexion au salon après validation
 *
 * Elle fournit également :
 *  - des messages de retour utilisateur (succès, erreur, information)
 *    via des notifications (toast)
 *  - une interface guidée expliquant les étapes pour rejoindre un salon
 *
 * Cette page utilise des composants UI réutilisables
 * (Button, Input, Card, Badge, Logo)
 * et respecte les thèmes clair et sombre.
 *
 * Elle s’intègre dans le système de navigation global
 * et redirige vers la page de chargement du salon
 * avant l’accès à l’interface de visionnage.
 */

import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Logo } from "../components/ui/Logo";
import {
  ArrowLeft,
  Hash,
  Lock,
  Users,
  Crown,
  Globe,
  LogIn,
  AlertCircle,
  CheckCircle,
  Key
} from "lucide-react";
import { toast } from "sonner";
import { fetchSalonByCode, joinSalon } from "../api/rooms";

interface JoinRoomPageProps {
  onNavigate: (page: string, data?: any) => void;
  currentUser: { email: string; name: string } | null;
  theme?: "light" | "dark";
}

export function JoinRoomPage({ onNavigate, currentUser, theme = "dark" }: JoinRoomPageProps) {
  const [roomCode, setRoomCode] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundRoom, setFoundRoom] = useState<any>(null);
  const [showPasswordField, setShowPasswordField] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("code");
    if (!codeFromUrl) return;
    setRoomCode(codeFromUrl.toUpperCase());
  }, []);

  const handleSearchRoom = async () => {
    if (!roomCode.trim()) {
      toast.error("Veuillez entrer un code de salon");
      return;
    }

    if (roomCode.length < 4) {
      toast.error("Le code doit contenir au moins 4 caractères");
      return;
    }

    setIsSearching(true);
    try {
      const room = await fetchSalonByCode(roomCode.trim());
      const roomData = {
        id: room.id_salon,
        name: room.name,
        description: room.description || "Aucune description",
        host: "Admin",
        participants: 0,
        maxParticipants: room.max_participants || 20,
        isPublic: !!room.is_public,
        hasPassword: !room.is_public && !!room.has_password,
        thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
        rating: 0,
        password: undefined,
      };
      setFoundRoom(roomData);
      setIsSearching(false);
      if (roomData.hasPassword) {
        setShowPasswordField(true);
        toast.info("🔒 Ce salon est protégé par un mot de passe");
      } else {
        toast.success("✅ Salon trouvé !");
      }
    } catch (error) {
      setIsSearching(false);
      setFoundRoom(null);
      toast.error("❌ Aucun salon trouvé avec ce code");
    }
  };

  useEffect(() => {
    if (!roomCode || roomCode.length < 4 || foundRoom || isSearching) return;
    handleSearchRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  const handleJoinRoom = async () => {
    if (!foundRoom) {
      toast.error("Veuillez d'abord rechercher un salon");
      return;
    }

    if (foundRoom.hasPassword && !roomPassword.trim()) {
      toast.error("Veuillez entrer le mot de passe du salon");
      return;
    }

    try {
      await joinSalon(foundRoom.id, foundRoom.hasPassword ? roomPassword : undefined);
      toast.success(`Connexion au salon "${foundRoom.name}"...`);
      setTimeout(() => {
        onNavigate("room-loading", { roomId: foundRoom.id });
      }, 500);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la connexion au salon");
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-black" : "bg-gray-50"}`}>
      {/* Header */}
      <header className={`${theme === "dark" ? "bg-black/95 border-b border-red-900/20" : "bg-white/95 border-b border-gray-200"} backdrop-blur-md shadow-lg sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <Button
              variant="ghost"
              onClick={() => onNavigate("rooms")}
              className={theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-black"}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full mb-6 shadow-lg shadow-red-600/50">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-4xl mb-4 font-display ${theme === "dark" ? "text-white" : "text-black"}`}>
              REJOINDRE UN SALON
            </h1>
            <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Entrez le code d'invitation pour rejoindre un salon privé
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Form */}
            <Card className={theme === "dark" ? "bg-zinc-900 border-red-900/20 text-white" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
                  <Hash className="w-5 h-5 text-red-500" />
                  Code du Salon
                </CardTitle>
                <CardDescription className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                  Demandez le code d'invitation à l'administrateur du salon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Room Code Input */}
                <div>
                  <Label htmlFor="roomCode" className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                    Code d'invitation *
                  </Label>
                  <div className="relative mt-2">
                    <Hash className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                    <Input
                      id="roomCode"
                      type="text"
                      placeholder="ABC123XYZ"
                      value={roomCode}
                      onChange={(e) => {
                        setRoomCode(e.target.value.toUpperCase());
                        setFoundRoom(null);
                        setShowPasswordField(false);
                        setRoomPassword("");
                      }}
                      className={`pl-11 h-12 text-lg uppercase tracking-wider ${theme === "dark"
                        ? "bg-zinc-800 border-zinc-700 text-white"
                        : "bg-white border-gray-300"
                        }`}
                      maxLength={12}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Les codes sont automatiquement convertis en majuscules
                  </p>
                </div>

                {/* Password Field (conditionally shown) */}
                {showPasswordField && (
                  <div className="animate-fade-in">
                    <Label htmlFor="roomPassword" className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                      Mot de passe *
                    </Label>
                    <div className="relative mt-2">
                      <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                      <Input
                        id="roomPassword"
                        type="password"
                        placeholder="Entrez le mot de passe"
                        value={roomPassword}
                        onChange={(e) => setRoomPassword(e.target.value)}
                        className={`pl-11 h-12 ${theme === "dark"
                          ? "bg-zinc-800 border-zinc-700 text-white"
                          : "bg-white border-gray-300"
                          }`}
                      />
                    </div>
                  </div>
                )}

                {/* Search Button */}
                {!foundRoom && (
                  <Button
                    onClick={handleSearchRoom}
                    disabled={isSearching}
                    className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Recherche...
                      </>
                    ) : (
                      <>
                        <Key className="w-5 h-5 mr-2" />
                        Rechercher le salon
                      </>
                    )}
                  </Button>
                )}

                {/* Join Button */}
                {foundRoom && (
                  <Button
                    onClick={handleJoinRoom}
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Rejoindre le salon
                  </Button>
                )}

                {/* Info Box */}
                <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-blue-950/20 border border-blue-900/30" : "bg-blue-50 border border-blue-200"}`}>
                  <p className={`text-sm ${theme === "dark" ? "text-blue-300" : "text-blue-800"}`}>
                    💡 <strong>Astuce :</strong> Le code d'invitation est fourni par l'administrateur du salon. Il est généralement composé de 6 à 12 caractères.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Right: Preview or Instructions */}
            {foundRoom ? (
              <Card className={theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Salon Trouvé
                  </CardTitle>
                  <CardDescription className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                    Voici les détails du salon
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Room Thumbnail */}
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={foundRoom.thumbnail}
                      alt={foundRoom.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-red-600">
                      {foundRoom.isPublic ? (
                        <>
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Privé
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Room Info */}
                  <div>
                    <h3 className={`text-xl mb-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
                      {foundRoom.name}
                    </h3>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      {foundRoom.description}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 pt-4 border-t border-red-900/20">
                    <div className="flex items-center justify-between">
                      <span className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        <Crown className="w-4 h-4 text-yellow-500" />
                        Hôte
                      </span>
                      <span className={theme === "dark" ? "text-white" : "text-black"}>
                        {foundRoom.host}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        <Users className="w-4 h-4 text-red-500" />
                        Participants
                      </span>
                      <span className={theme === "dark" ? "text-white" : "text-black"}>
                        {foundRoom.participants}/{foundRoom.maxParticipants}
                      </span>
                    </div>

                    {foundRoom.hasPassword && (
                      <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-yellow-950/20 border border-yellow-900/30" : "bg-yellow-50 border border-yellow-200"}`}>
                        <p className={`text-sm flex items-center gap-2 ${theme === "dark" ? "text-yellow-300" : "text-yellow-800"}`}>
                          <Lock className="w-4 h-4" />
                          Salon protégé par mot de passe
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className={theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    Comment ça marche ?
                  </CardTitle>
                  <CardDescription>
                    Suivez ces étapes simples
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className={`mb-1 ${theme === "dark" ? "text-white" : "text-black"}`}>
                        Obtenez le code
                      </h4>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-600"}`}>
                        Demandez le code d'invitation à l'administrateur du salon que vous souhaitez rejoindre.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className={`mb-1 ${theme === "dark" ? "text-white" : "text-black"}`}>
                        Entrez le code
                      </h4>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-600"}`}>
                        Saisissez le code dans le champ ci-contre et cliquez sur "Rechercher le salon".
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className={`mb-1 ${theme === "dark" ? "text-white" : "text-black"}`}>
                        Mot de passe (optionnel)
                      </h4>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-600"}`}>
                        Si le salon est protégé, entrez le mot de passe fourni par l'administrateur.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                      4
                    </div>
                    <div>
                      <h4 className={`mb-1 ${theme === "dark" ? "text-white" : "text-black"}`}>
                        Rejoignez !
                      </h4>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-600"}`}>
                        Cliquez sur "Rejoindre" et profitez du visionnage collaboratif en temps réel !
                      </p>
                    </div>
                  </div>

                  {/* Example */}
                  <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-purple-950/20 border border-purple-900/30" : "bg-purple-50 border border-purple-200"}`}>
                    <p className={`text-sm ${theme === "dark" ? "text-purple-300" : "text-purple-800"}`}>
                      🎯 <strong>Exemple de code :</strong> CINEMA2025
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-12 text-center">
            <p className={`mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Vous n'avez pas de code ?
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                variant="outline"
                onClick={() => onNavigate("rooms")}
                className={theme === "dark" ? "border-red-600 text-red-500 hover:bg-red-950/30" : "border-red-600 text-red-600 hover:bg-red-50"}
              >
                <Globe className="w-4 h-4 mr-2" />
                Parcourir les salons publics
              </Button>
              <Button
                onClick={() => onNavigate("create-room")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Créer votre propre salon
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
