import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Video, 
  ArrowLeft, 
  Settings, 
  Users, 
  Shield, 
  List,
  BarChart3,
  Info
} from "lucide-react";
import { RoomInfoSettings } from "../components/settings/RoomInfoSettings";
import { RoomPermissionsSettings } from "../components/settings/RoomPermissionsSettings";
import { RoomMembersSettings } from "../components/settings/RoomMembersSettings";
import { RoomPlaylistSettings } from "../components/settings/RoomPlaylistSettings";
import { RoomPollsSettings } from "../components/settings/RoomPollsSettings";

interface RoomSettingsPageProps {
  roomId: string;
  currentUser: { email: string; name: string };
  onNavigate: (page: string) => void;
  theme?: "light" | "dark";
}

export function RoomSettingsPage({ roomId, currentUser, onNavigate, theme = "dark" }: RoomSettingsPageProps) {
  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-black" : "bg-gray-50"}`}>
      {/* Header */}
      <header className={`border-b ${theme === "dark" ? "border-red-900/20 bg-zinc-900/80" : "border-gray-200 bg-white/80"} backdrop-blur-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => onNavigate('room')}
            className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au salon
          </button>
          <div className="flex items-center gap-2">
            <Video className="w-8 h-8 text-red-600" />
            <span className="text-white">WithYou</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-red-600" />
            <h1 className="text-white">Paramètres du salon</h1>
          </div>
          <p className="text-gray-400">
            Gérez tous les aspects de votre salon
          </p>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Informations</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Membres</span>
            </TabsTrigger>
            <TabsTrigger value="playlist" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Playlist</span>
            </TabsTrigger>
            <TabsTrigger value="polls" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Sondages</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <RoomInfoSettings roomId={roomId} />
          </TabsContent>

          <TabsContent value="permissions">
            <RoomPermissionsSettings roomId={roomId} />
          </TabsContent>

          <TabsContent value="members">
            <RoomMembersSettings roomId={roomId} />
          </TabsContent>

          <TabsContent value="playlist">
            <RoomPlaylistSettings roomId={roomId} />
          </TabsContent>

          <TabsContent value="polls">
            <RoomPollsSettings roomId={roomId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}