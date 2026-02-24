/**
 * EmailSentPage Component
 * ----------------------
 * Cette page informe l’utilisateur qu’un email de confirmation
 * a été envoyé après son inscription.
 *
 * Fonctionnalités principales :
 * - Affichage de l’adresse email de destination
 * - Instructions claires sur les étapes à suivre pour confirmer le compte
 * - Possibilité de renvoyer l’email de confirmation
 * - Mode démo permettant de simuler la confirmation du compte
 * - Gestion du thème clair / sombre (light / dark)
 *
 * Comportement :
 * - L’utilisateur arrive sur cette page après la création du compte
 * - Un message de confirmation rassure l’utilisateur
 * - Le bouton "Renvoyer l’email" affiche une notification de succès
 * - En mode démo, la confirmation redirige vers la page "account-confirmed"
 *
 * UI / UX :
 * - Interface moderne et centrée sur l’utilisateur
 * - Icône illustrative avec effet lumineux
 * - Design responsive avec Tailwind CSS
 * - Notifications utilisateur via Sonner
 *
 * Props :
 * @param email          Adresse email utilisée lors de l’inscription
 * @param onNavigate     Fonction de navigation entre les pages
 * @param theme          Thème actuel de l’application ("light" | "dark")
 * @param onThemeToggle  Fonction permettant de changer le thème
 */
import { Button } from "../components/ui/Button";
import { Logo } from "../components/ui/Logo";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";
import { resendConfirmationEmail } from "../api/auth";

interface EmailSentPageProps {
  email: string;
  onNavigate: (page: string) => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function EmailSentPage({ email, onNavigate, theme = "dark", onThemeToggle }: EmailSentPageProps) {
  const targetEmail = useMemo(() => {
    return email || localStorage.getItem("pendingConfirmationEmail") || "";
  }, [email]);

  const handleResendEmail = async () => {
    if (!targetEmail) {
      toast.error("Aucune adresse email disponible");
      return;
    }
    try {
      await resendConfirmationEmail(targetEmail);
      toast.success("Email de confirmation renvoye !");
    } catch (error: any) {
      toast.error(error?.message || "Impossible de renvoyer l'email");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-black" : "bg-gray-50"}`}>
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

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-xl">
        <div className={`rounded-3xl shadow-2xl p-8 md:p-12 text-center ${
          theme === "dark" 
            ? "bg-zinc-900 border border-zinc-800" 
            : "bg-white border border-gray-200"
        }`}>
          {/* Email Icon with Glow Effect */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-50"></div>
            {/* Icon Container */}
            <div className="relative w-32 h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-xl shadow-red-600/50">
              <Mail className="w-16 h-16 text-white" strokeWidth={2} />
            </div>
          </div>

          <h1 className={`text-2xl md:text-3xl mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Vérifiez votre email
          </h1>
          
          <p className={`mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Un lien de confirmation a été envoyé à :
          </p>
          
          <p className={`mb-8 text-lg ${theme === "dark" ? "text-red-500" : "text-red-600"}`}>
            {targetEmail || "Votre adresse email"}
          </p>

          {/* Next Steps Box */}
          <div className={`rounded-xl p-6 mb-8 text-left ${
            theme === "dark" ? "bg-black" : "bg-gray-50"
          }`}>
            <p className={`mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Prochaines étapes :
            </p>
            <ol className={`space-y-2 list-none ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              <li>1. Ouvrez votre boîte email</li>
              <li>2. Cliquez sur le lien de confirmation</li>
              <li>3. Votre compte sera activé automatiquement</li>
            </ol>
          </div>

          {/* Resend Email Link */}
          <button
            onClick={handleResendEmail}
            className="text-red-500 hover:text-red-600 transition-colors mb-6"
          >
            Renvoyer l&apos;email
          </button>

          <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
            Vous n&apos;avez pas reçu d&apos;email ? Vérifiez vos spams ou{" "}
            <button
              onClick={handleResendEmail}
              className="text-red-500 hover:text-red-600 transition-colors underline"
            >
              renvoyez-le
            </button>
          </p>

          {/* Demo Mode Section */}
          <div className="mt-8 pt-8 border-t border-zinc-800">
            <Button
              onClick={() => onNavigate("signin")}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-base shadow-lg shadow-red-600/30"
            >
              Aller a la connexion
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
