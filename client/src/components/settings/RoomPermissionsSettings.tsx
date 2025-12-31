/**
 * Projet : WithYou
 * Fichier : components/settings/RoomPermissionsSettings.tsx
 *
 * Description :
 * Composant permettant de gérer les permissions des membres d’un salon.
 * Il permet d’activer ou désactiver certaines actions comme le chat,
 * la mise en pause, le changement de vidéo ou les invitations.
 */

import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Save, MessageCircle, Pause, Video, Key } from "lucide-react";
import { toast } from "sonner";

interface RoomPermissionsSettingsProps {
  roomId: string;
}

export function RoomPermissionsSettings({ roomId }: RoomPermissionsSettingsProps) {
  const [permissions, setPermissions] = useState({
    allowChat: true,
    allowPause: false,
    allowVideoChange: false,
    allowInvites: true
  });

  const handleSave = () => {
    toast.success("Permissions mises à jour !");
  };

  const permissionItems = [
    {
      id: "allowChat",
      icon: MessageCircle,
      label: "Autoriser le chat",
      description: "Les membres peuvent envoyer des messages dans le chat",
      color: "text-blue-600"
    },
    {
      id: "allowPause",
      icon: Pause,
      label: "Autoriser les mises en pause",
      description: "Les membres peuvent mettre en pause la vidéo",
      color: "text-purple-600"
    },
    {
      id: "allowVideoChange",
      icon: Video,
      label: "Autoriser le changement de vidéo",
      description: "Les membres peuvent changer la vidéo en cours",
      color: "text-green-600"
    },
    {
      id: "allowInvites",
      icon: Key,
      label: "Gérer les codes d&apos;invitation",
      description: "Les membres peuvent générer des codes d&apos;invitation",
      color: "text-orange-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions des membres</CardTitle>
        <CardDescription>
          Définissez ce que les membres peuvent faire dans le salon
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissionItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon className={`w-5 h-5 ${item.color}`} />
                <div>
                  <Label htmlFor={item.id} className="cursor-pointer">
                    {item.label}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>
              <Switch
                id={item.id}
                checked={permissions[item.id as keyof typeof permissions]}
                onCheckedChange={(checked) => 
                  setPermissions({ ...permissions, [item.id]: checked })
                }
              />
            </div>
          );
        })}

        <div className="pt-4">
          <Button onClick={handleSave} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder les permissions
          </Button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Conseil :</strong> Désactivez les permissions si vous souhaitez 
            garder un contrôle total sur l&apos;expérience de visionnage.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}