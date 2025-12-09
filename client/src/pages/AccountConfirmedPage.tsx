import { Button } from "../components/ui/button";
import { Logo } from "../components/ui/Logo";
import { CheckCircle } from "lucide-react";

interface AccountConfirmedPageProps {
  onNavigate: (page: string) => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function AccountConfirmedPage({ onNavigate, theme = "dark", onThemeToggle }: AccountConfirmedPageProps) {
  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-black" : "bg-gray-50"}`}>
      {/* Theme Toggle Button */}
      {onThemeToggle && (
        <button
          onClick={onThemeToggle}
          className={`fixed top-4 right-4 z-50 p-3 rounded-full ${
            theme === "dark" 
              ? "bg-zinc-800 hover:bg-zinc-700 text-yellow-400" 
              : "bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
          } transition-all duration-300`}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      )}

      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center">
          <Logo size="sm" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-md">
        <div className={`rounded-2xl shadow-2xl p-8 text-center border ${
          theme === "dark" 
            ? "bg-zinc-900 border-zinc-800" 
            : "bg-white border-gray-200"
        }`}>
          {/* Success Icon */}
          <div className={`w-24 h-24 bg-gradient-to-br ${
            theme === "dark" ? "from-green-500 to-green-700 shadow-green-500/50" : "from-green-400 to-green-600 shadow-green-400/30"
          } rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-glow`}>
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className={theme === "dark" ? "text-white mb-4" : "text-gray-900 mb-4"}>Compte activé !</h1>
          
          <p className={`mb-8 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Votre compte a été activé avec succès. Vous pouvez maintenant vous 
            connecter et commencer à regarder des vidéos avec vos amis.
          </p>

          <Button 
            size="lg"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={() => onNavigate('signin')}
          >
            Se connecter
          </Button>

          <div className={`mt-8 pt-6 border-t ${theme === "dark" ? "border-zinc-800" : "border-gray-200"}`}>
            <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Prêt à découvrir WithYou ?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className={`p-3 rounded-lg border ${
                theme === "dark" ? "bg-black/50 border-zinc-800" : "bg-gray-50 border-gray-200"
              }`}>
                <div className="text-2xl mb-1">🎬</div>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Vidéos sync</p>
              </div>
              <div className={`p-3 rounded-lg border ${
                theme === "dark" ? "bg-black/50 border-zinc-800" : "bg-gray-50 border-gray-200"
              }`}>
                <div className="text-2xl mb-1">💬</div>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Chat live</p>
              </div>
              <div className={`p-3 rounded-lg border ${
                theme === "dark" ? "bg-black/50 border-zinc-800" : "bg-gray-50 border-gray-200"
              }`}>
                <div className="text-2xl mb-1">👥</div>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Communauté</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}