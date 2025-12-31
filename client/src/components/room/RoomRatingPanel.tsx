/**
 * Projet : WithYou
 * Fichier : components/room/RoomRatingPanel.tsx
 *
 * Description :
 * Panneau modal permettant aux utilisateurs de noter un salon
 * avec un système d’étoiles (1 à 5).
 * Il affiche également le classement des meilleurs administrateurs
 * selon leur note moyenne.
 *
 * Fonctionnalités principales :
 * - Notation du salon par étoiles (1 à 5)
 * - Limitation à un vote par salon toutes les 24 heures
 * - Affichage d’un message d’erreur si l’utilisateur a déjà voté
 * - Affichage du temps restant avant le prochain vote autorisé
 * - Classement des administrateurs les mieux notés
 *
 * Sécurité & logique :
 * - Vérification du vote via le stockage local (voteStorage)
 * - Empêche les votes multiples abusifs
 *
 * Objectif :
 * - Encourager l’interaction et le feedback des utilisateurs
 * - Valoriser les salons et administrateurs les mieux notés
 */
import { X, Star, Trophy, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { hasRatedRoom, recordRoomRating, getTimeUntilNextVote, formatTimeUntilNextVote } from "../../utils/voteStorage";

interface TopAdmin {
  name: string;
  rating: number;
  avatar: string;
  rank: number;
}

interface RoomRatingPanelProps {
  roomId: string;
  onClose: () => void;
  theme?: "light" | "dark";
  topAdmins?: TopAdmin[];
}

export function RoomRatingPanel({ roomId, onClose, theme = "dark", topAdmins = [] }: RoomRatingPanelProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasAlreadyRated, setHasAlreadyRated] = useState(false);

  useEffect(() => {
    setHasAlreadyRated(hasRatedRoom(roomId));
  }, [roomId]);

  const handleRatingClick = (value: number) => {
    if (hasAlreadyRated) {
      const hoursRemaining = getTimeUntilNextVote("room", roomId);
      toast.error(`Vous avez déjà noté ce salon ! ${formatTimeUntilNextVote(hoursRemaining)}`);
      return;
    }

    const success = recordRoomRating(roomId);
    if (!success) {
      const hoursRemaining = getTimeUntilNextVote("room", roomId);
      toast.error(`Vous avez déjà noté ce salon ! ${formatTimeUntilNextVote(hoursRemaining)}`);
      return;
    }

    setRating(value);
    setHasAlreadyRated(true);
    toast.success(`Vous avez noté ce salon ${value}/5 étoiles ! Prochaine notation dans 24h.`);
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  // Mock data si pas de topAdmins fournis
  const defaultTopAdmins: TopAdmin[] = [
    {
      name: "Admin Pro",
      rating: 4.9,
      avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23F59E0B'/%3E%3Ccircle cx='100' cy='80' r='35' fill='white' opacity='0.9'/%3E%3Cellipse cx='100' cy='160' rx='55' ry='40' fill='white' opacity='0.9'/%3E%3C/svg%3E",
      rank: 1
    },
    {
      name: "Superhost",
      rating: 4.8,
      avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Ccircle cx='100' cy='100' r='100' fill='%238B5CF6'/%3E%3Ccircle cx='100' cy='80' r='35' fill='white' opacity='0.9'/%3E%3Cellipse cx='100' cy='160' rx='55' ry='40' fill='white' opacity='0.9'/%3E%3C/svg%3E",
      rank: 2
    },
    {
      name: "EliteOrga",
      rating: 4.7,
      avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Ccircle cx='100' cy='100' r='100' fill='%2310B981'/%3E%3Ccircle cx='100' cy='80' r='35' fill='white' opacity='0.9'/%3E%3Cellipse cx='100' cy='160' rx='55' ry='40' fill='white' opacity='0.9'/%3E%3C/svg%3E",
      rank: 3
    }
  ];

  const adminsToShow = topAdmins.length > 0 ? topAdmins : defaultTopAdmins;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl">Notez ce salon</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Subtitle */}
          <p className="text-gray-400 text-center">Votre avis compte</p>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleRatingClick(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-12 h-12 ${
                    (hoveredRating || rating) >= value
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Top Administrators */}
          <div>
            <h3 className="text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Administrateurs
            </h3>
            <div className="space-y-3">
              {adminsToShow.map((admin) => (
                <div
                  key={admin.rank}
                  className="flex items-center gap-3 bg-zinc-800/50 rounded-lg p-3 hover:bg-zinc-800 transition-colors"
                >
                  {/* Rank Badge */}
                  <div className="relative">
                    <img
                      src={admin.avatar}
                      alt={admin.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {admin.rank}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex-1">
                    <p className="text-white text-sm">{admin.name}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-white text-sm">{admin.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}