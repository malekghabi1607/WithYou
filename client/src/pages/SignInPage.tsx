/**
 * SignInPage Component
 * --------------------
 * Cette page permet à l’utilisateur de se connecter à l’application.
 *
 * Fonctionnalités principales :
 * - Formulaire de connexion avec email et mot de passe
 * - Validation simple des champs (champs requis)
 * - Gestion du thème clair / sombre (light / dark)
 * - Navigation vers :
 *   - la page des salons après connexion
 *   - la page d’inscription
 *   - la page "mot de passe oublié"
 * - Affichage de notifications de succès via Sonner
 *
 * Comportement :
 * - Lors de la soumission du formulaire, si les champs sont valides,
 *   l’utilisateur est connecté et redirigé vers la page "rooms".
 * - Le nom de l’utilisateur est automatiquement extrait de l’email.
 *
 * UI / UX :
 * - Interface moderne avec fond animé
 * - Icônes Lucide
 * - Design responsive avec Tailwind CSS
 *
 * Props :
 * @param onNavigate  Fonction de navigation entre les pages
 * @param onSignIn    Fonction appelée lors de la connexion réussie
 * @param theme       Thème actuel ("light" | "dark")
 * @param onThemeToggle Fonction pour changer le thème
 */
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Logo } from "../components/ui/Logo";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { login } from "../api/auth";


interface SignInPageProps {
  onNavigate: (page: string) => void;
  onSignIn: (email: string, name: string) => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function SignInPage({ onNavigate, onSignIn, theme = "dark", onThemeToggle }: SignInPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email || !password) return;

  try {
    const { token } = await login(email, password);
    localStorage.setItem("token", token);

    const name = email.split("@")[0];
    onSignIn(email, name);

    toast.success("Connexion réussie !");
    onNavigate("rooms");
  } catch (err: any) {
    toast.error("Erreur de connexion : " + (err?.message || "inconnue"));
  }
};



  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === "dark" ? "bg-black" : "bg-gray-50"}`}>
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

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 ${
          theme === "dark" ? "bg-red-600/20" : "bg-red-200/40"
        } rounded-full blur-3xl animate-pulse-glow`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${
          theme === "dark" ? "bg-red-800/20" : "bg-red-300/40"
        } rounded-full blur-3xl animate-pulse-glow`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 w-80 h-80 ${
          theme === "dark" ? "bg-red-700/10" : "bg-red-100/30"
        } rounded-full blur-3xl animate-pulse-glow`} style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className={`w-full max-w-md ${
          theme === "dark" 
            ? "bg-zinc-900 border-zinc-800" 
            : "bg-white border-gray-200 shadow-2xl"
        }`}>
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center mb-2">
              <Logo size="lg" />
            </div>
            <div>
              <CardTitle className={`text-3xl mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                <span className="font-display">BON RETOUR !</span>
              </CardTitle>
              <CardDescription className={theme === "dark" ? "text-gray-400 text-base" : "text-gray-600 text-base"}>
                Connectez-vous pour rejoindre vos salons
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className={theme === "dark" ? "text-gray-200" : "text-gray-700"}>
                  Email
                </Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }`} />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${
                      theme === "dark"
                        ? "bg-black border-zinc-800 text-white placeholder:text-gray-500 focus:border-red-600"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-red-500"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className={theme === "dark" ? "text-gray-200" : "text-gray-700"}>
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }`} />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 ${
                      theme === "dark"
                        ? "bg-black border-zinc-800 text-white placeholder:text-gray-500 focus:border-red-600"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-red-500"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => onNavigate("forgot-password")}
                  className={`text-sm ${
                    theme === "dark" 
                      ? "text-red-500 hover:text-red-400" 
                      : "text-red-600 hover:text-red-700"
                  }`}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 text-white group"
              >
                <span>Se connecter</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className={`mt-6 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              <p>
                Pas encore de compte ?{" "}
                <button
                  onClick={() => onNavigate("signup")}
                  className={theme === "dark" ? "text-red-500 hover:text-red-400" : "text-red-600 hover:text-red-700"}
                >
                  S&apos;inscrire
                </button>
              </p>
            </div>

            {/* Features */}
            <div className={`mt-8 pt-6 border-t ${theme === "dark" ? "border-zinc-800" : "border-gray-200"}`}>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-4 flex items-center justify-center gap-2`}>
                <Sparkles className="w-4 h-4" />
                Retrouvez votre expérience :
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className={`p-3 rounded-lg border ${
                  theme === "dark" ? "bg-black/50 border-zinc-800" : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="text-2xl mb-1">🎬</div>
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Vos salons</p>
                </div>
                <div className={`p-3 rounded-lg border ${
                  theme === "dark" ? "bg-black/50 border-zinc-800" : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="text-2xl mb-1">📜</div>
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Vos playlists</p>
                </div>
                <div className={`p-3 rounded-lg border ${
                  theme === "dark" ? "bg-black/50 border-zinc-800" : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="text-2xl mb-1">⚙️</div>
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Vos réglages</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
