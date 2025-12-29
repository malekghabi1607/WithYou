/**
 * Projet : WithYou
 * Fichier : pages/SignUpPage.tsx
 *
 * Description :
 * Cette page implémente l’interface d’inscription des utilisateurs à la plateforme WithYou.
 * Elle permet la création d’un compte via un formulaire contrôlé (nom, email, mot de passe),
 * avec des validations côté client et un retour visuel immédiat.
 *
 * Fonctionnalités principales :
 * - Saisie et validation des informations utilisateur
 * - Vérification de la force et de la confirmation du mot de passe
 * - Gestion des erreurs et succès via des notifications
 * - Navigation vers les pages d’authentification associées
 *
 * Cette page s’intègre dans le système d’authentification global
 * et respecte le design system ainsi que les modes clair et sombre.
 */
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Logo } from "../components/ui/Logo";
import { User, Mail, Lock, ArrowRight, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { register } from "../api/auth";
interface SignUpPageProps {
  onNavigate: (page: string) => void;
  onSignUp: (email: string, name: string) => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function SignUpPage({ onNavigate, onSignUp, theme = "dark", onThemeToggle }: SignUpPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordStrength = password.length >= 8;
  const passwordsMatch = password === confirmPassword && password.length > 0;



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    toast.error("Les mots de passe ne correspondent pas");
    return;
  }
  if (password.length < 8) {
    toast.error("Le mot de passe doit contenir au moins 8 caractères");
    return;
  }

  try {
    // Appel backend
    const { token } = await register({
      name: name,
      email,
      password,
      password_confirmation: confirmPassword,
    });

    // Si le backend renvoie un token, on le garde (optionnel)
    if (token) localStorage.setItem("token", token);

    toast.success("Compte créé avec succès !");
    onNavigate("email-sent"); // ou "sign-in" si vous préférez
  } catch (err: any) {
    toast.error("Erreur d'inscription : " + (err?.message || "inconnue"));
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
                <span className="font-display">CRÉER UN COMPTE</span>
              </CardTitle>
              <CardDescription className={theme === "dark" ? "text-gray-400 text-base" : "text-gray-600 text-base"}>
                Rejoignez la communauté WithYou
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className={theme === "dark" ? "text-gray-200" : "text-gray-700"}>
                  Nom complet
                </Label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }`} />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`pl-10 ${
                      theme === "dark"
                        ? "bg-black border-zinc-800 text-white placeholder:text-gray-500 focus:border-red-600"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-red-500"
                    }`}
                    required
                  />
                </div>
              </div>

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
                {password.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className={`h-1 flex-1 rounded-full ${
                      passwordStrength 
                        ? theme === "dark" ? "bg-green-600" : "bg-green-500"
                        : theme === "dark" ? "bg-red-600" : "bg-red-500"
                    }`} />
                    <span className={`text-xs ${
                      passwordStrength
                        ? theme === "dark" ? "text-green-500" : "text-green-600"
                        : theme === "dark" ? "text-red-500" : "text-red-600"
                    }`}>
                      {passwordStrength ? "Fort" : "Faible"}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className={theme === "dark" ? "text-gray-200" : "text-gray-700"}>
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }`} />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 ${
                      theme === "dark"
                        ? "bg-black border-zinc-800 text-white placeholder:text-gray-500 focus:border-red-600"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-red-500"
                    }`}
                    required
                  />
                  {confirmPassword.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Check className={`w-5 h-5 ${
                        passwordsMatch 
                          ? theme === "dark" ? "text-green-500" : "text-green-600"
                          : theme === "dark" ? "text-red-500" : "text-red-600"
                      }`} />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                size="lg"
                className={`w-full group ${
                  theme === "dark"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                disabled={!passwordStrength || !passwordsMatch}
              >
                <span>Créer mon compte</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            {/* Sign In Link */}
            <div className={`mt-6 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              <p>
                Vous avez déjà un compte ?{" "}
                <button
                  onClick={() => onNavigate("signin")}
                  className={theme === "dark" ? "text-red-500 hover:text-red-400" : "text-red-600 hover:text-red-700"}
                >
                  Se connecter
                </button>
              </p>
            </div>

            {/* Features */}
            <div className={`mt-8 pt-6 border-t ${theme === "dark" ? "border-zinc-800" : "border-gray-200"}`}>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-4 flex items-center justify-center gap-2`}>
                <Sparkles className="w-4 h-4" />
                En vous inscrivant, vous pourrez :
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className={`p-3 rounded-lg border ${
                  theme === "dark" ? "bg-black/50 border-zinc-800" : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="text-2xl mb-1">🎬</div>
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Créer des salons</p>
                </div>
                <div className={`p-3 rounded-lg border ${
                  theme === "dark" ? "bg-black/50 border-zinc-800" : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="text-2xl mb-1">👥</div>
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Inviter des amis</p>
                </div>
                <div className={`p-3 rounded-lg border ${
                  theme === "dark" ? "bg-black/50 border-zinc-800" : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="text-2xl mb-1">💬</div>
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Chatter en live</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
