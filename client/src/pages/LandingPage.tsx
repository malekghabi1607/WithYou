/**
 * Projet : WithYou
 * Fichier : pages/LandingPage.tsx
 *
 * Description :
 * Page d’accueil publique (non connectée).
 * Présente :
 *    - Le concept du projet
 *    - Les fonctionnalités principales
 *    - Des boutons vers Connexion et Inscription
 *
 * Première page vue par un nouvel utilisateur.
 */
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Header } from "../components/layouts/Header";
import { Footer } from "../components/layouts/Footer";
import { 
  Play, 
  Users, 
  MessageCircle, 
  Shield, 
  Zap, 
  Globe,
  Crown,
  Heart,
  Star,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function LandingPage({ onNavigate, theme = "dark", onThemeToggle }: LandingPageProps) {
  const features = [
    {
      icon: Play,
      title: "Synchronisation Parfaite",
      description: "Regardez des vidéos en parfaite synchronisation avec vos amis, peu importe la distance."
    },
    {
      icon: MessageCircle,
      title: "Chat en Direct",
      description: "Discutez en temps réel avec des réactions emoji et partagez vos impressions."
    },
    {
      icon: Users,
      title: "Salons Illimités",
      description: "Créez autant de salons que vous voulez, publics ou privés."
    },
    {
      icon: Crown,
      title: "Contrôle Administrateur",
      description: "Gérez les permissions, modérez les membres et contrôlez la lecture."
    },
    {
      icon: Shield,
      title: "Sécurisé & Privé",
      description: "Vos données sont protégées. Salons privés avec mot de passe."
    },
    {
      icon: Zap,
      title: "Ultra Rapide",
      description: "Temps de latence minimal pour une expérience fluide et agréable."
    }
  ];



  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      <Header 
        currentPage="landing" 
        onNavigate={onNavigate}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />

      {/* Hero Section */}
      <section className={`relative overflow-hidden ${theme === "dark" ? "bg-gradient-to-b from-black via-red-950/20 to-black" : "bg-gradient-to-b from-gray-50 via-red-50 to-white"} py-20 md:py-32`}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 left-10 w-96 h-96 ${theme === "dark" ? "bg-red-600/20" : "bg-red-300/20"} rounded-full blur-3xl animate-pulse-glow`}></div>
          <div className={`absolute bottom-20 right-10 w-96 h-96 ${theme === "dark" ? "bg-red-800/20" : "bg-red-200/20"} rounded-full blur-3xl animate-pulse-glow`} style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`text-4xl md:text-5xl mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              <span className="gradient-text">Partagez vos moments vidéo</span>
              <br />
              <span className={theme === "dark" ? "text-white" : "text-gray-900"}>avec ceux que vous aimez</span>
            </h1>
            <p className={`text-lg md:text-xl ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-6 max-w-2xl mx-auto`}>
              Une plateforme de visionnage collaboratif en temps réel. 
              Synchronisez vos vidéos, chattez et profitez ensemble, même à distance.
            </p>
            <p className={`text-xl md:text-2xl mb-8 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
              100% Gratuit • Sans publicité • Sans limites
            </p>
            
            {/* Preview Image */}
            <div className="mt-12 rounded-2xl overflow-hidden shadow-2xl max-w-3xl mx-auto">
              <img 
                src="https://images.unsplash.com/photo-1692188071339-2825a8a997f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRzJTIwd2F0Y2hpbmclMjBtb3ZpZSUyMHRvZ2V0aGVyfGVufDF8fHx8MTc2NDc2NDQxNXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Amis regardant des vidéos ensemble"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 ${theme === "dark" ? "bg-black" : "bg-white"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Fonctionnalités
            </h2>
            <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Tout ce dont vous avez besoin pour regarder ensemble
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-gray-50 border-gray-200"} hover:border-red-600 transition-all transform hover:scale-105 hover:-translate-y-1`}
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-red-600/20 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-red-500" />
                  </div>
                  <h3 className={`text-lg mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{feature.title}</h3>
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={`py-20 ${theme === "dark" ? "bg-gradient-to-b from-black via-red-950/10 to-black" : "bg-gradient-to-b from-white via-red-50/30 to-gray-50"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Comment ça marche
            </h2>
            <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Commencez en 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1762330470472-d88a6565e7c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMHN0cmVhbWluZyUyMGludGVyZmFjZXxlbnwxfHx8fDE3NjQ3MTAzMzd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Interface de streaming"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-4">
                1
              </div>
              <h3 className={`text-lg mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Créez un Salon</h3>
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                Créez votre salon personnalisé en quelques clics
              </p>
            </div>

            <div className="text-center">
              <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1601510145916-f07c8e1100eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBjaGF0dGluZyUyMG9ubGluZXxlbnwxfHx8fDE3NjQ3NjQ0MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Chat en ligne"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-4">
                2
              </div>
              <h3 className={`text-lg mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Invitez vos Amis</h3>
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                Partagez le lien et invitez vos proches
              </p>
            </div>

            <div className="text-center">
              <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1692188071339-2825a8a997f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRzJTIwd2F0Y2hpbmclMjBtb3ZpZSUyMHRvZ2V0aGVyfGVufDF8fHx8MTc2NDc2NDQxNXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Regarder ensemble"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-4">
                3
              </div>
              <h3 className={`text-lg mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Regardez Ensemble</h3>
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                Profitez de moments inoubliables ensemble
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${theme === "dark" ? "bg-gradient-to-b from-black via-red-950/20 to-black" : "bg-gradient-to-b from-gray-50 via-red-50 to-white"}`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className={`text-3xl md:text-4xl mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Rejoignez WithYou dès maintenant
          </h2>
          <p className={`text-lg mb-6 max-w-2xl mx-auto ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            La meilleure plateforme pour regarder vos vidéos préférées avec vos amis, où qu'ils soient
          </p>
          <p className={`text-xl mb-8 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
            Inscription rapide • Totalement gratuit • Aucune carte bancaire
          </p>
        </div>
      </section>

      <Footer onNavigate={onNavigate} theme={theme} />
    </div>
  );
}
export default LandingPage;