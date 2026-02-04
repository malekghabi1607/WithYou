


/**
 * Projet : WithYou
 * Fichier : components/settings/RoomInfoSettings.tsx
 *
 * Description :
 * Composant responsable de la gestion des informations générales d’un salon.
 * Il permet de modifier les paramètres principaux tels que le nom, la description,
 * la visibilité (public/privé), l’URL de la vidéo et le nombre maximal de participants.
 *
 * Ce composant utilise des champs de formulaire contrôlés
 * et déclenche une action de sauvegarde des paramètres.
 */

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Globe, Lock, Save } from "lucide-react";
import { toast } from "sonner";

interface RoomInfoSettingsProps {
  roomId: string;
}

export function RoomInfoSettings({ roomId }: RoomInfoSettingsProps) {
  const [formData, setFormData] = useState({
    name: "🎬 Soirée Cinéma Classique",
    description: "Un salon dédié aux plus grands films classiques du cinéma",
    videoUrl: "https://www.youtube.com/watch?v=example",
    isPublic: true,
    password: "",
    maxParticipants: 20
  });

  const handleSave = () => {
    toast.success("Paramètres sauvegardés !");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du salon</CardTitle>
        <CardDescription>
          Modifiez les informations de base de votre salon
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="name">Nom du salon</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="videoUrl">Vidéo par défaut (URL YouTube)</Label>
          <Input
            id="videoUrl"
            type="url"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            className="mt-1"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {formData.isPublic ? (
              <Globe className="w-5 h-5 text-green-600" />
            ) : (
              <Lock className="w-5 h-5 text-orange-600" />
            )}
            <div>
              <Label htmlFor="isPublic">
                {formData.isPublic ? "Salon public" : "Salon privé"}
              </Label>
              <p className="text-xs text-gray-500">
                {formData.isPublic 
                  ? "Visible par tous"
                  : "Accessible avec code uniquement"
                }
              </p>
            </div>
          </div>
          <Switch
            id="isPublic"
            checked={formData.isPublic}
            onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
          />
        </div>

        {!formData.isPublic && (
          <div>
            <Label htmlFor="password">Code d&apos;invitation</Label>
            <Input
              id="password"
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1"
              placeholder="CINEMA2024"
            />
          </div>
        )}

        <div>
          <Label htmlFor="maxParticipants">Nombre maximum de participants</Label>
          <Input
            id="maxParticipants"
            type="number"
            min={2}
            max={100}
            value={formData.maxParticipants}
            onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
            className="mt-1"
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder les modifications
        </Button>
      </CardContent>
    </Card>
  );
}