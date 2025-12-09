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
  onClose: () => void;
  topAdmins: TopAdmin[];
  roomId: string;
}

export function RoomRatingPanel({ onClose, topAdmins, roomId }: RoomRatingPanelProps) {
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
              {topAdmins.map((admin) => (
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