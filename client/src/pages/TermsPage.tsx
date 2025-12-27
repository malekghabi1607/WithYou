/**
 * TermsPage
 * ---------
 * Cette page présente les Conditions d’Utilisation de la plateforme.
 * Elle informe les utilisateurs sur leurs droits, obligations
 * et les règles d’utilisation du service.
 *
 * Contenu principal :
 * - Acceptation des conditions
 * - Description du service proposé
 * - Règles de conduite et responsabilités des utilisateurs
 * - Propriété intellectuelle et contenu
 * - Limitation de responsabilité et résiliation
 * - Droit applicable et informations de contact
 *
 * La page s’intègre dans la navigation globale avec Header et Footer
 * et prend en charge le thème clair / sombre.
 */
import { Header } from "../components/layouts/Header";
import { Footer } from "../components/layouts/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale, UserX } from "lucide-react";

interface TermsPageProps {
  onNavigate: (page: string) => void;
  currentUser?: { email: string; name: string } | null;
  onLogout?: () => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function TermsPage({ 
  onNavigate, 
  currentUser, 
  onLogout,
  theme = "dark",
  onThemeToggle 
}: TermsPageProps) {
  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
      <Header
        currentUser={currentUser}
        currentPage="terms"
        onNavigate={onNavigate}
        onLogout={onLogout}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
              theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"
            } mb-6`}>
              <FileText className={`w-10 h-10 ${theme === "dark" ? "text-blue-500" : "text-blue-600"}`} />
            </div>
            <h1 className="text-4xl mb-4">Conditions d&apos;Utilisation</h1>
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              Dernière mise à jour : 8 décembre 2024
            </p>
          </div>

          <div className="space-y-6">
            {/* Acceptation */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Acceptation des Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>
                  En accédant et en utilisant cette plateforme, vous acceptez d&apos;être lié par ces conditions 
                  d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser nos services.
                </p>
                <p>
                  Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications 
                  prendront effet immédiatement après leur publication sur la plateforme.
                </p>
              </CardContent>
            </Card>

            {/* Description du service */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle>Description du Service</CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>
                  Notre plateforme permet aux utilisateurs de :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Créer et rejoindre des salons vidéo</li>
                  <li>Regarder des vidéos de manière synchronisée avec d&apos;autres utilisateurs</li>
                  <li>Communiquer via le chat en temps réel</li>
                  <li>Gérer des playlists collaboratives</li>
                  <li>Participer à des sondages</li>
                </ul>
              </CardContent>
            </Card>

            {/* Compte utilisateur */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="w-5 h-5 text-purple-500" />
                  Compte Utilisateur
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <div>
                  <h3 className="font-semibold mb-2">Création de compte :</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Vous devez avoir au moins 13 ans pour créer un compte</li>
                    <li>Vous devez fournir des informations exactes et à jour</li>
                    <li>Vous êtes responsable de la sécurité de votre mot de passe</li>
                    <li>Un compte par personne</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Responsabilités :</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Vous êtes responsable de toutes les activités sur votre compte</li>
                    <li>Informez-nous immédiatement de toute utilisation non autorisée</li>
                    <li>Ne partagez pas vos identifiants de connexion</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Règles de conduite */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Règles de Conduite
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>Vous vous engagez à NE PAS :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Publier du contenu illégal, offensant ou inapproprié</li>
                  <li>Harceler, menacer ou intimider d&apos;autres utilisateurs</li>
                  <li>Usurper l&apos;identité d&apos;une autre personne</li>
                  <li>Partager du contenu protégé par des droits d&apos;auteur sans autorisation</li>
                  <li>Utiliser des robots, scripts ou autres moyens automatisés</li>
                  <li>Tenter de perturber ou d&apos;endommager la plateforme</li>
                  <li>Collecter des données d&apos;autres utilisateurs</li>
                  <li>Promouvoir des activités illégales</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contenu */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle>Contenu et Propriété Intellectuelle</CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <div>
                  <h3 className="font-semibold mb-2">Votre contenu :</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Vous conservez la propriété de votre contenu</li>
                    <li>Vous accordez à la plateforme une licence pour afficher votre contenu</li>
                    <li>Vous garantissez avoir les droits nécessaires sur le contenu partagé</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Notre contenu :</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>La plateforme et son contenu sont protégés par des droits d&apos;auteur</li>
                    <li>Vous ne pouvez pas copier, modifier ou distribuer notre contenu sans autorisation</li>
                    <li>Tous les logos et marques sont notre propriété</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Limitation de responsabilité */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-red-500" />
                  Limitation de Responsabilité
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>
                  La plateforme est fournie &quot;telle quelle&quot; sans garantie d&apos;aucune sorte. Nous ne garantissons pas :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>La disponibilité continue du service</li>
                  <li>L&apos;absence d&apos;erreurs ou de bugs</li>
                  <li>L&apos;exactitude du contenu partagé par les utilisateurs</li>
                  <li>La sécurité absolue des données</li>
                </ul>
                <p className="mt-4">
                  Nous ne serons pas responsables des dommages indirects, accessoires ou consécutifs résultant 
                  de l&apos;utilisation de la plateforme.
                </p>
              </CardContent>
            </Card>

            {/* Résiliation */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-orange-500" />
                  Résiliation
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>
                  Nous nous réservons le droit de suspendre ou de résilier votre compte à tout moment, 
                  avec ou sans préavis, si :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Vous violez ces conditions d&apos;utilisation</li>
                  <li>Votre comportement nuit à d&apos;autres utilisateurs</li>
                  <li>Nous détectons une activité frauduleuse</li>
                  <li>Requis par la loi</li>
                </ul>
                <p className="mt-4">
                  Vous pouvez également supprimer votre compte à tout moment depuis vos paramètres.
                </p>
              </CardContent>
            </Card>

            {/* Droit applicable */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle>Droit Applicable et Juridiction</CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>
                  Ces conditions sont régies par les lois françaises. Tout litige relatif à l&apos;utilisation 
                  de la plateforme sera soumis à la juridiction exclusive des tribunaux français.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className={theme === "dark" ? "bg-blue-900/20 border-blue-900/30" : "bg-blue-50 border-blue-200"}>
              <CardHeader>
                <CardTitle>Nous Contacter</CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>
                  Pour toute question concernant ces conditions d&apos;utilisation, contactez-nous :
                </p>
                <div className="space-y-2">
                  <p><span className="font-semibold">Email :</span> legal@example.com</p>
                  <p><span className="font-semibold">Adresse :</span> 123 Rue des Conditions, Paris, France</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} theme={theme} />
    </div>
  );
}