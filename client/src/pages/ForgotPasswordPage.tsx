/**
 * ForgotPasswordPage Component
 * ----------------------------
 * Cette page permet à l’utilisateur de demander la réinitialisation
 * de son mot de passe en renseignant son adresse email.
 *
 * Fonctionnalités principales :
 * - Formulaire de saisie de l’adresse email
 * - Validation basique du format de l’email
 * - Simulation de l’envoi d’un email de réinitialisation
 * - Affichage d’un écran de confirmation après l’envoi
 * - Gestion de l’état de chargement (loading)
 * - Navigation vers la page de connexion
 *
 * Comportement :
 * - Si l’email est vide ou invalide, un message d’erreur est affiché.
 * - Lors de l’envoi, un délai est simulé pour représenter une requête serveur.
 * - Une fois l’email envoyé, un message de succès est affiché
 *   et l’utilisateur voit les instructions de réinitialisation.
 *
 * UI / UX :
 * - Interface responsive avec design moderne
 * - Support du thème clair / sombre (light / dark)
 * - Icônes Lucide pour améliorer la lisibilité
 * - Notifications utilisateur via Sonner
 *
 * Props :
 * @param onNavigate  Fonction de navigation entre les pages
 * @param theme       Thème actuel de l’application ("light" | "dark")
 */
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Logo } from "../components/ui/Logo";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { forgotPassword } from "../api/auth";
interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
  theme?: "light" | "dark";
}

export function ForgotPasswordPage({ onNavigate, theme = "dark" }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Veuillez entrer votre adresse email");
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    setIsLoading(true);
try {
  await forgotPassword(email);

  setEmailSent(true);
  toast.success("Email envoyé ! Vérifiez votre boîte de réception.");
} catch (err: any) {
  toast.error("Erreur : " + (err?.message || "inconnue"));
} finally {
  setIsLoading(false);
}
  };

  if (emailSent) {
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
            <CardTitle className="text-2xl">Email envoyé !</CardTitle>
            <CardDescription className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              Nous avons envoyé un lien de réinitialisation à <span className="font-semibold text-red-500">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-red-900/20 border border-red-900/30" : "bg-red-50 border border-red-200"
            }`}>
              <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe. 
                Le lien expirera dans <span className="font-semibold">24 heures</span>.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                onClick={() => onNavigate("signin")}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Retour à la connexion
              </Button>
              
              <button
                onClick={() => setEmailSent(false)}
                className={`w-full text-sm ${
                  theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                } transition-colors`}
              >
                Renvoyer l'email
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <button 
            onClick={() => onNavigate("signin")}
            className={`flex items-center gap-2 mb-4 ${
              theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
            } transition-colors`}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          
          <div className="flex justify-center mb-6">
            <Logo size="md" />
          </div>
          
          <CardTitle className="text-2xl">Mot de passe oublié ?</CardTitle>
          <CardDescription className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Adresse email
              </Label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`} />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${
                    theme === "dark" 
                      ? "bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-500" 
                      : "bg-white border-gray-300"
                  }`}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Vous vous souvenez de votre mot de passe ?{" "}
              <button
                onClick={() => onNavigate("signin")}
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                Se connecter
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
