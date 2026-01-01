import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Logo } from "../components/ui/Logo";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
// Importe la nouvelle fonction qu'on vient de créer
import { resetPassword } from "../api/auth";

interface ResetPasswordPageProps {
  token?: string; // Peut venir des props si tu utilises un loader
  onNavigate: (page: string) => void;
  theme?: "light" | "dark";
}

export function ResetPasswordPage({ token: propToken, onNavigate, theme = "dark" }: ResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // 1. Récupérer l'email et le token depuis l'URL
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(propToken || null);

  useEffect(() => {
    // Récupérer les paramètres ?email=...
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    if (emailFromUrl) setEmail(emailFromUrl);

    // Si le token n'est pas passé en props, on essaie de le trouver dans l'URL
    // Ex: /reset-password/LE_TOKEN_ICI
    if (!token) {
        const pathSegments = window.location.pathname.split('/');
        const potentialToken = pathSegments[pathSegments.length - 1]; 
        // Vérification basique pour ne pas prendre "reset-password" comme token
        if (potentialToken && potentialToken !== "reset-password") {
            setToken(potentialToken);
        }
    }
  }, [propToken, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Le mot de passe doit faire au moins 8 caractères");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (!token || !email) {
      toast.error("Lien invalide (Token ou Email manquant)");
      return;
    }

    setIsLoading(true);

    try {
      // APPEL AU VRAI BACKEND
      await resetPassword({
        token: token,
        email: email,
        password: password,
        password_confirmation: confirmPassword,
      });

      setResetSuccess(true);
      toast.success("Mot de passe modifié avec succès !");
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la réinitialisation");
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${theme === "dark" ? "bg-gradient-to-br from-black via-red-950/20 to-black" : "bg-gray-50"}`}>
        <Card className={`w-full max-w-md ${theme === "dark" ? "bg-black/50 border-red-900/30 backdrop-blur-xl" : "bg-white"}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Mot de passe réinitialisé !</CardTitle>
            <CardDescription>Vous pouvez maintenant vous connecter.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onNavigate("signin")} className="w-full bg-red-600 hover:bg-red-700 text-white">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === "dark" ? "bg-gradient-to-br from-black via-red-950/20 to-black" : "bg-gray-50"}`}>
      <Card className={`w-full max-w-md ${theme === "dark" ? "bg-black/50 border-red-900/30 backdrop-blur-xl" : "bg-white"}`}>
        <CardHeader className="text-center">
          <Logo size="md" />
          <CardTitle className="text-2xl mt-4">Nouveau mot de passe</CardTitle>
          <CardDescription>Entrez votre nouveau mot de passe.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2">
                   <Lock className="w-4 h-4 text-gray-400" />
                </button>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2">
                   <Lock className="w-4 h-4 text-gray-400" />
                </button>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
              {isLoading ? "Envoi..." : "Valider"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}