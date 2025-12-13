/**
 * Projet : WithYou
 * Fichier : pages/CreateRoomPage.tsx
 *
 * Description :
 * Page de création d’un nouveau salon de visionnage collaboratif.
 *
 * Cette page permet à un utilisateur connecté :
 *  - de définir le nom et la description du salon
 *  - de choisir une vidéo YouTube initiale
 *  - de configurer la visibilité du salon (public ou privé)
 *  - de définir un mot de passe pour les salons privés
 *  - de limiter le nombre maximum de participants
 *
 * Elle gère :
 *  - la validation des champs du formulaire
 *  - l’affichage de messages de succès ou d’erreur
 *    via des notifications utilisateur
 *  - la création du salon côté front
 *  - la sauvegarde des données dans le localStorage
 *
 * Une fois le salon créé, l’utilisateur est redirigé
 * vers la page de chargement du salon avant l’accès
 * à l’interface de visionnage.
 *
 * Cette page utilise des composants UI réutilisables
 * (Button, Input, Textarea, Switch, Card)
 * ainsi que les layouts globaux (Header, Footer),
 * et respecte les thèmes clair et sombre.
 */



import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Header } from "../components/layouts/Header";
import { Footer } from "../components/layouts/Footer";
import { Video, Lock, Globe, Users, Link as LinkIcon, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { saveRoom, Room } from "../utils/storage";

interface CreateRoomPageProps {
  currentUser: { email: string; name: string };
  onNavigate: (page: string, data?: any) => void;
  onCreateRoom: (roomData: any) => void;
  theme?: "light" | "dark";
}

export function CreateRoomPage({ currentUser, onNavigate, onCreateRoom, theme = "dark" }: CreateRoomPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    videoUrl: "",
    isPublic: true,
    password: "",
    maxParticipants: 20
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Veuillez entrer un nom pour le salon");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Veuillez ajouter une description");
      return;
    }

    if (!formData.videoUrl.trim()) {
      toast.error("Veuillez ajouter une URL de vidéo YouTube");
      return;
    }

    if (!formData.videoUrl.includes('youtube.com') && !formData.videoUrl.includes('youtu.be')) {
      toast.error("Veuillez entrer une URL YouTube valide");
      return;
    }

    if (!formData.isPublic && !formData.password) {
      toast.error("Veuillez définir un mot de passe pour un salon privé");
      return;
    }

    // Create room object
    const roomId = "room-" + Date.now();
    const newRoom: Room = {
      id: roomId,
      name: formData.name,
      description: formData.description,
      isPublic: formData.isPublic,
      creator: currentUser.name,
      creatorEmail: currentUser.email,
      password: formData.password,
      maxParticipants: formData.maxParticipants,
      videoUrl: formData.videoUrl,
      participants: 1,
      currentVideo: formData.videoUrl,
      thumbnail: "https://images.unsplash.com/photo-1758686254041-88d7b6ecee8f?w=400",
      createdAt: new Date().toISOString(),
      rating: 0
    };

    // Save to localStorage
    saveRoom(newRoom);

    toast.success(`✅ Salon "${formData.name}" créé avec succès !`);
    
    // Passer le bon roomId à onCreateRoom et onNavigate
    onCreateRoom({ ...formData, id: roomId });
    onNavigate("room-loading", { roomId });
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      <Header 
        currentUser={currentUser}
        currentPage="create-room"
        onNavigate={onNavigate}
        theme={theme}
      />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"} shadow-2xl`}>
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
                  <Video className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <div>
                <CardTitle className={`text-3xl mb-2 font-display ${theme === "dark" ? "text-white" : "text-black"}`}>
                  CRÉER UN SALON
                </CardTitle>
                <CardDescription className={`text-base ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Configurez votre salon de visionnage collaboratif
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Room Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    <Video className="w-4 h-4 text-red-500" />
                    Nom du salon
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: 🎬 Soirée Cinéma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={`h-12 ${
                      theme === "dark"
                        ? "bg-zinc-800/50 border-red-900/30 text-white placeholder:text-gray-500"
                        : "bg-white border-gray-300 text-black placeholder:text-gray-400"
                    } focus:border-red-600`}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez l'ambiance de votre salon..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                    className={`${
                      theme === "dark"
                        ? "bg-zinc-800/50 border-red-900/30 text-white placeholder:text-gray-500"
                        : "bg-white border-gray-300 text-black placeholder:text-gray-400"
                    } focus:border-red-600`}
                  />
                </div>

                {/* Video URL */}
                <div className="space-y-2">
                  <Label htmlFor="videoUrl" className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    <LinkIcon className="w-4 h-4 text-red-500" />
                    URL de la vidéo YouTube
                  </Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    required
                    className={`h-12 ${
                      theme === "dark"
                        ? "bg-zinc-800/50 border-red-900/30 text-white placeholder:text-gray-500"
                        : "bg-white border-gray-300 text-black placeholder:text-gray-400"
                    } focus:border-red-600`}
                  />
                </div>

                {/* Public/Private */}
                <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-zinc-800/30" : "bg-gray-50"} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {formData.isPublic ? (
                        <Globe className="w-5 h-5 text-green-500" />
                      ) : (
                        <Lock className="w-5 h-5 text-orange-500" />
                      )}
                      <div>
                        <Label className={theme === "dark" ? "text-white" : "text-black"}>
                          {formData.isPublic ? "Salon public" : "Salon privé"}
                        </Label>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {formData.isPublic 
                            ? "Tout le monde peut rejoindre"
                            : "Nécessite un mot de passe"
                          }
                        </p>
                      </div>
                    </div>
                    <Switch 
                    checked={formData.isPublic} 
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, isPublic: checked })
                      }
                    />
                  </div>

                  {!formData.isPublic && (
                    <div className="space-y-2 pt-2 border-t border-red-900/20">
                      <Label htmlFor="password" className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        <Lock className="w-4 h-4 text-red-500" />
                        Mot de passe du salon
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`h-12 ${
                          theme === "dark"
                            ? "bg-zinc-800/50 border-red-900/30 text-white"
                            : "bg-white border-gray-300 text-black"
                        } focus:border-red-600`}
                      />
                    </div>
                  )}
                </div>

                {/* Max Participants */}
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants" className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    <Users className="w-4 h-4 text-red-500" />
                    Nombre maximum de participants
                  </Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="2"
                    max="100"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    className={`h-12 ${
                      theme === "dark"
                        ? "bg-zinc-800/50 border-red-900/30 text-white"
                        : "bg-white border-gray-300 text-black"
                    } focus:border-red-600`}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onNavigate("rooms")}
                    className={`flex-1 h-12 ${
                      theme === "dark"
                        ? "border-red-900/30 text-gray-300 hover:bg-zinc-800"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/50"
                  >
                    Créer le salon
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips */}
          <div className={`mt-8 grid md:grid-cols-2 gap-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            <Card className={`${theme === "dark" ? "bg-zinc-900/50 border-red-900/20" : "bg-white border-gray-200"}`}>
              <CardContent className="p-4">
                <h4 className={`flex items-center gap-2 mb-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
                  <Sparkles className="w-4 h-4 text-red-500" />
                  Astuce
                </h4>
                <p className="text-sm">
                  Choisissez un nom accrocheur avec des emojis pour attirer plus de participants !
                </p>
              </CardContent>
            </Card>

            <Card className={`${theme === "dark" ? "bg-zinc-900/50 border-red-900/20" : "bg-white border-gray-200"}`}>
              <CardContent className="p-4">
                <h4 className={`flex items-center gap-2 mb-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
                  <Users className="w-4 h-4 text-red-500" />
                  Conseil
                </h4>
                <p className="text-sm">
                  Les salons publics attirent plus de monde, mais les privés offrent plus d'intimité.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} theme={theme} />
    </div>
  );
}