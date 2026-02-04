/**
 * Projet : WithYou
 * Fichier : components/settings/RoomMembersSettings.tsx
 *
 * Description :
 * Composant de gestion des membres d’un salon.
 *
 * Il permet à l’administrateur ou aux modérateurs de :
 *  - Visualiser la liste des membres du salon
 *  - Rechercher un membre par son nom
 *  - Identifier le rôle de chaque utilisateur (admin, modérateur, membre)
 *  - Voir le statut de connexion (en ligne / hors ligne)
 *  - Gérer les actions sur les membres (promotion, retrait, blocage)
 *
 * L’interface utilise des composants UI réutilisables (Card, Badge, DropdownMenu)
 * afin de garantir une expérience cohérente et ergonomique.
 *
 * Les données sont actuellement simulées (mock) et pourront être
 * remplacées ultérieurement par des données issues de l’API.
 */
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { 
  Search, 
  Crown, 
  Shield, 
  UserMinus, 
  Ban,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  role: "admin" | "moderator" | "member";
  status: "online" | "offline";
  joinedAt: string;
}

const mockMembers: Member[] = [
  { id: "1", name: "CinePhile", role: "admin", status: "online", joinedAt: "Il y a 3 jours" },
  { id: "2", name: "MovieFan", role: "moderator", status: "online", joinedAt: "Il y a 2 jours" },
  { id: "3", name: "Sarah", role: "member", status: "online", joinedAt: "Il y a 1 jour" },
  { id: "4", name: "Lucas", role: "member", status: "online", joinedAt: "Il y a 12 heures" },
  { id: "5", name: "Emma", role: "member", status: "offline", joinedAt: "Il y a 8 heures" },
  { id: "6", name: "Thomas", role: "member", status: "online", joinedAt: "Il y a 5 heures" },
  { id: "7", name: "Marie", role: "member", status: "offline", joinedAt: "Il y a 3 heures" },
  { id: "8", name: "Alex", role: "member", status: "online", joinedAt: "Il y a 1 heure" }
];

interface RoomMembersSettingsProps {
  roomId: string;
}

export function RoomMembersSettings({ roomId }: RoomMembersSettingsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<Member[]>(mockMembers);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveMember = (memberId: string, memberName: string) => {
    toast.success(`${memberName} a été retiré du salon`);
    setMembers(members.filter(m => m.id !== memberId));
  };

  const handleBlockMember = (memberName: string) => {
    toast.success(`${memberName} a été bloqué`);
  };

  const handlePromoteModerator = (memberName: string) => {
    toast.success(`${memberName} est maintenant modérateur`);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-yellow-500">Admin</Badge>;
      case "moderator":
        return <Badge className="bg-blue-500">Modérateur</Badge>;
      default:
        return <Badge variant="secondary">Membre</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des membres</CardTitle>
        <CardDescription>
          Gérez les utilisateurs de votre salon ({members.length} membres)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Members List */}
        <div className="space-y-2">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">
                    {member.name.charAt(0)}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      member.status === "online" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{member.name}</span>
                    {getRoleIcon(member.role)}
                  </div>
                  <p className="text-xs text-gray-500">
                    Rejoint {member.joinedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getRoleBadge(member.role)}
                
                {member.role !== "admin" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role === "member" && (
                        <>
                          <DropdownMenuItem onClick={() => handlePromoteModerator(member.name)}>
                            <Shield className="w-4 h-4 mr-2" />
                            Promouvoir modérateur
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        className="text-orange-600"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Retirer du salon
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleBlockMember(member.name)}
                        className="text-red-600"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Bloquer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Aucun membre trouvé
          </p>
        )}
      </CardContent>
    </Card>
  );
}
