/**
 * Projet : WithYou
 * Fichier : pages/ResetPasswordPage.tsx
 *
 * Description :
 * Page de réinitialisation du mot de passe.
 * Accessible via le lien reçu par email après avoir demandé
 * la récupération du mot de passe.
 * Permet de définir un nouveau mot de passe de manière sécurisée.
 */

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Logo } from "../components/ui/Logo";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ResetPasswordPageProps {
  token?: string; // Token reçu dans l'URL
  onNavigate: (page: string) => void;
  theme?: "light" | "dark";
}

export function ResetPasswordPage({ token, onNavigate, theme = "dark" }: ResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // Vérifier la validité du token au chargement
  useEffect(() => {
    if (!token || token.length < 10) {
      setTokenValid(false);
      return;
    }

    // Vérifier si le token existe et n'a pas expiré
    const users = JSON.parse(localStorage.getItem("withyou_users") || "[]");
    const user = users.find((u: any) => u.resetToken === token);
    
    if (!user) {
      setTokenValid(false);
      return;
    }

    // Vérifier l'expiration
    if (user.resetTokenExpiry && Date.now() > user.resetTokenExpiry) {
      setTokenValid(false);
      toast.error("Ce lien de réinitialisation a expiré");
    }
  }, [token]);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Le mot de passe doit contenir au moins une majuscule";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Le mot de passe doit contenir au moins une minuscule";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Le mot de passe doit contenir au moins un chiffre";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    // Simuler la réinitialisation du mot de passe
    setTimeout(() => {
      // Mettre à jour le mot de passe dans localStorage
      const users = JSON.parse(localStorage.getItem("withyou_users") || "[]");
      const userToUpdate = users.find((u: any) => u.resetToken === token);
      
      if (userToUpdate) {
        userToUpdate.password = password;
        userToUpdate.resetToken = null;
        userToUpdate.resetTokenExpiry = null;
        localStorage.setItem("withyou_users", JSON.stringify(users));
      }

      setIsLoading(false);
      setResetSuccess(true);
      toast.success("Mot de passe réinitialisé avec succès !");
    }, 1500);
  };

  // Token invalide ou expiré
  if (!tokenValid) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        theme === "dark" 
          ? "bg-gradient-to-br from-black via-red-950/20 to-black" 
          : "bg-gradient-to-br from-gray-50 via-red-50 to-gray-50"
      }`}>
        <Card className={`w-full max-w-md ${
          theme === "dark" 
            ? "bg-black/50 border-red-900/30 backdrop-blur-xl" 
            : "bg-white border-gray-200"
        }`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 rounded-full ${
                theme === "dark" ? "bg-red-900/30" : "bg-red-100"
              } flex items-center justify-center`}>
                <AlertCircle className={`w-12 h-12 ${
                  theme === "dark" ? "text-red-500" : "text-red-600"
                }`} />
              </div>
            </div>
            <CardTitle className="text-2xl">Lien invalide ou expiré</CardTitle>
            <CardDescription className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              Ce lien de réinitialisation n'est plus valide ou a expiré.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-red-900/20 border border-red-900/30" : "bg-red-50 border border-red-200"
            }`}>
              <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Les liens de réinitialisation expirent après 24 heures pour des raisons de sécurité.
              </p>
            </div>

            <Button
              onClick={() => onNavigate("forgot-password")}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Demander un nouveau lien
            </Button>

            <button
              onClick={() => onNavigate("signin")}
              className={`w-full text-sm ${
                theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
              } transition-colors`}
            >
              Retour à la connexion
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Succès de la réinitialisation
  if (resetSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        theme === "dark" 
          ? "bg-gradient-to-br from-black via-red-950/20 to-black" 
          : "bg-gradient-to-br from-gray-50 via-red-50 to-gray-50"
      }`}>
        <Card className={`w-full max-w-md ${
          theme === "dark" 
            ? "bg-black/50 border-red-900/30 backdrop-blur-xl" 
            : "bg-white border-gray-200"
        }`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 rounded-full ${
                theme === "dark" ? "bg-green-900/30" : "bg-green-100"
              } flex items-center justify-center`}>
                <CheckCircle className={`w-12 h-12 ${
                  theme === "dark" ? "text-green-500" : "text-green-600"
                }`} />
              </div>
            </div>
            <CardTitle className="text-2xl">Mot de passe réinitialisé !</CardTitle>
            <CardDescription className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              Votre mot de passe a été changé avec succès
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-green-900/20 border border-green-900/30" : "bg-green-50 border border-green-200"
            }`}>
              <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
            </div>

            <Button
              onClick={() => onNavigate("signin")}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulaire de réinitialisation
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === "dark" 
        ? "bg-gradient-to-br from-black via-red-950/20 to-black" 
        : "bg-gradient-to-br from-gray-50 via-red-50 to-gray-50"
    }`}>
      <Card className={`w-full max-w-md ${
        theme === "dark" 
          ? "bg-black/50 border-red-900/30 backdrop-blur-xl" 
          : "bg-white border-gray-200"
      }`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="md" />
          </div>
          
          <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
          <CardDescription className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            Choisissez un nouveau mot de passe sécurisé pour votre compte
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nouveau mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password" className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 ${
                    theme === "dark" 
                      ? "bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-500" 
                      : "bg-white border-gray-300"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    theme === "dark" ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                  } transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmer le mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`} />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 ${
                    theme === "dark" 
                      ? "bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-500" 
                      : "bg-white border-gray-300"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    theme === "dark" ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                  } transition-colors`}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Critères de sécurité */}
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-900/50 border border-gray-800" : "bg-gray-50 border border-gray-200"
            }`}>
              <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Le mot de passe doit contenir :
              </p>
              <ul className={`space-y-1 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
                <li className={password.length >= 8 ? "text-green-500" : ""}>
                  • Au moins 8 caractères
                </li>
                <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>
                  • Une lettre majuscule
                </li>
                <li className={/[a-z]/.test(password) ? "text-green-500" : ""}>
                  • Une lettre minuscule
                </li>
                <li className={/[0-9]/.test(password) ? "text-green-500" : ""}>
                  • Un chiffre
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate("signin")}
              className={`text-sm ${
                theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
              } transition-colors`}
            >
              Retour à la connexion
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}