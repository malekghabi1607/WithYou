import { Header } from "../components/layouts/Header";
import { Footer } from "../components/layouts/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from "lucide-react";

interface PrivacyPageProps {
  onNavigate: (page: string) => void;
  currentUser?: { email: string; name: string } | null;
  onLogout?: () => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function PrivacyPage({ 
  onNavigate, 
  currentUser, 
  onLogout,
  theme = "dark",
  onThemeToggle 
}: PrivacyPageProps) {
  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
      <Header
        currentUser={currentUser}
        currentPage="privacy"
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
              theme === "dark" ? "bg-red-900/30" : "bg-red-100"
            } mb-6`}>
              <Shield className={`w-10 h-10 ${theme === "dark" ? "text-red-500" : "text-red-600"}`} />
            </div>
            <h1 className="text-4xl mb-4">Politique de Confidentialité</h1>
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              Dernière mise à jour : 8 décembre 2024
            </p>
          </div>

          <div className="space-y-6">
            {/* Introduction */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>
                  Bienvenue sur notre plateforme de salons vidéo. Nous nous engageons à protéger votre vie privée 
                  et vos données personnelles. Cette politique de confidentialité explique comment nous collectons, 
                  utilisons et protégeons vos informations.
                </p>
              </CardContent>
            </Card>

            {/* Collecte des données */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  Collecte des Données
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <div>
                  <h3 className="font-semibold mb-2">Informations que nous collectons :</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Informations d&apos;identification : nom, adresse email</li>
                    <li>Informations de profil : photo, préférences</li>
                    <li>Données d&apos;utilisation : salons visités, vidéos regardées</li>
                    <li>Informations techniques : adresse IP, type de navigateur, appareil</li>
                    <li>Messages et interactions dans les salons</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Comment nous collectons ces données :</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Lors de votre inscription</li>
                    <li>Pendant votre utilisation de la plateforme</li>
                    <li>Via des cookies et technologies similaires</li>
                    <li>Par vos interactions avec d&apos;autres utilisateurs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Utilisation des données */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-500" />
                  Utilisation des Données
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>Nous utilisons vos données pour :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fournir et améliorer nos services</li>
                  <li>Personnaliser votre expérience</li>
                  <li>Gérer votre compte et authentification</li>
                  <li>Faciliter la communication dans les salons</li>
                  <li>Envoyer des notifications importantes</li>
                  <li>Analyser l&apos;utilisation de la plateforme</li>
                  <li>Prévenir la fraude et assurer la sécurité</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
              </CardContent>
            </Card>

            {/* Partage des données */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-500" />
                  Partage des Données
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations avec :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><span className="font-semibold">Autres utilisateurs :</span> Informations de profil public, messages dans les salons</li>
                  <li><span className="font-semibold">Fournisseurs de services :</span> Hébergement, analyses, support client</li>
                  <li><span className="font-semibold">Autorités légales :</span> Si requis par la loi</li>
                </ul>
              </CardContent>
            </Card>

            {/* Sécurité */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-yellow-500" />
                  Sécurité des Données
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Chiffrement des données en transit (SSL/TLS)</li>
                  <li>Authentification sécurisée</li>
                  <li>Contrôles d&apos;accès stricts</li>
                  <li>Surveillance continue des systèmes</li>
                  <li>Sauvegardes régulières</li>
                </ul>
              </CardContent>
            </Card>

            {/* Vos droits */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle>Vos Droits</CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>Vous avez le droit de :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Accéder à vos données personnelles</li>
                  <li>Corriger vos informations</li>
                  <li>Supprimer votre compte et vos données</li>
                  <li>Exporter vos données</li>
                  <li>Vous opposer au traitement de vos données</li>
                  <li>Retirer votre consentement</li>
                </ul>
                <p className="mt-4">
                  Pour exercer ces droits, contactez-nous à : <span className="text-red-500">privacy@example.com</span>
                </p>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle>Cookies et Technologies Similaires</CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>Nous utilisons des cookies pour :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintenir votre connexion</li>
                  <li>Mémoriser vos préférences</li>
                  <li>Analyser le trafic</li>
                  <li>Améliorer nos services</li>
                </ul>
                <p className="mt-4">
                  Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className={theme === "dark" ? "bg-red-900/20 border-red-900/30" : "bg-red-50 border-red-200"}>
              <CardHeader>
                <CardTitle>Nous Contacter</CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                <p>
                  Pour toute question concernant cette politique de confidentialité, contactez-nous :
                </p>
                <div className="space-y-2">
                  <p><span className="font-semibold">Email :</span> privacy@example.com</p>
                  <p><span className="font-semibold">Adresse :</span> 123 Rue de la Confidentialité, Paris, France</p>
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