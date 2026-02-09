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
import { Video, Lock, Globe, Users, Link as LinkIcon, Settings, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { extractYouTubeId } from "../utils/youtubeUtils";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Logo } from "../components/ui/Logo";
import { createSalon, extractYoutubeId } from "../api/rooms";

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

  const getErrorMessage = (error: any, fallback: string) => {
    const message =
      error?.message ||
      error?.error_description ||
      error?.details ||
      error?.hint ||
      fallback;
    return message === fallback ? fallback : `${fallback}: ${message}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Extraire youtubeId
    const youtubeId = extractYoutubeId(formData.videoUrl);
    if (!youtubeId) {
      toast.error("Impossible d'extraire l'ID YouTube de cette URL");
      return;
    }

    try {
      // Importer createSalon depuis api/rooms    
      // Création du salon côté back avec vidéo initiale
      const salon = await createSalon({
        name: formData.name,
        description: formData.description,
        youtubeId,
        title: formData.name,
        isPublic: formData.isPublic,
        password: formData.password || undefined,
        maxParticipants: formData.maxParticipants,
      });

      const roomId = salon.id_salon;
      const invitationCode = salon.id_salon; // Using ID as code for now

      // AFFICHER LE CODE D'INVITATION
      toast.success(`✅ Salon "${formData.name}" créé avec succès !`, {
        description: `📋 Code d'invitation : ${invitationCode}`,
        duration: 10000,
      });

      onCreateRoom({ ...formData, id: roomId, joinCode: invitationCode });
      onNavigate("room-loading", { roomId });
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Erreur lors de la création du salon"));
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

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
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
                  Configurez votre espace de visionnage collaboratif
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                <Settings className="w-5 h-5 text-red-500" />
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
                    className={`h-12 ${theme === "dark"
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
                    className={`${theme === "dark"
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
                    className={`h-12 ${theme === "dark"
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
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, isPublic: Boolean(checked) }))
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
                        className={`h-12 ${theme === "dark"
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
                    className={`h-12 ${theme === "dark"
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
                    className={`flex-1 h-12 ${theme === "dark"
                        ? "border-red-900/30 text-gray-300 hover:bg-zinc-800"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    onClick={() => console.log("CLICK CREATE")}
                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/50"
                  >
                    Créer le salon
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
