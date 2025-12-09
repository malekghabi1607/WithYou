import { Video, MessageCircle, Users, Play } from "lucide-react";

interface EmptyStateProps {
  type: "videos" | "messages" | "participants" | "salons";
  theme?: "light" | "dark";
}

export function EmptyState({ type, theme = "dark" }: EmptyStateProps) {
  const states = {
    videos: {
      icon: Video,
      title: "Aucune vidéo dans la playlist",
      description: "Ajoutez des vidéos YouTube pour commencer à regarder ensemble"
    },
    messages: {
      icon: MessageCircle,
      title: "Aucun message pour l'instant",
      description: "Soyez le premier à envoyer un message dans le chat"
    },
    participants: {
      icon: Users,
      title: "En attente de membres...",
      description: "Partagez le lien du salon pour inviter vos amis"
    },
    salons: {
      icon: Play,
      title: "Aucun salon disponible",
      description: "Créez votre premier salon pour commencer à regarder ensemble"
    }
  };

  const state = states[type];
  const Icon = state.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={`w-16 h-16 rounded-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
      </div>
      <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-base mb-2`}>
        {state.title}
      </h3>
      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm text-center max-w-sm`}>
        {state.description}
      </p>
    </div>
  );
}
