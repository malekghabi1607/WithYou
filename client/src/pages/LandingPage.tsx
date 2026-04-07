/**
 * Projet : WithYou
 * Fichier : pages/LandingPage.tsx
 *
 * Plateforme éducative universitaire.
 * Public cible : Étudiants & Professeurs.
 */
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/card";
import { Header } from "../components/layouts/Header";
import { Footer } from "../components/layouts/Footer";
import {
  Play,
  Users,
  MessageCircle,
  Shield,
  Crown,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  BookOpen,
  BarChart2,
  Video,
  Zap,
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function LandingPage({ onNavigate, theme = "dark", onThemeToggle }: LandingPageProps) {
  const features = [
    {
      icon: Video,
      title: "Cours Vidéo Synchronisés",
      description: "Professeurs et étudiants visionnent le même cours en temps réel, sans aucun décalage."
    },
    {
      icon: MessageCircle,
      title: "Questions en Direct",
      description: "Les étudiants posent leurs questions pendant le cours. Les professeurs répondent instantanément."
    },
    {
      icon: Users,
      title: "Salons de Cours & TD",
      description: "Créez des espaces dédiés à chaque matière, groupe ou promotion — publics ou privés."
    },
    {
      icon: Crown,
      title: "Contrôle Pédagogique",
      description: "Les professeurs gèrent la lecture, les droits de parole et modèrent les participants."
    },
    {
      icon: BarChart2,
      title: "Sondages & Quiz",
      description: "Lancez des sondages en direct pour évaluer la compréhension et engager les étudiants."
    },
    {
      icon: Shield,
      title: "Environnement Sécurisé",
      description: "Accès réservé aux membres inscrits. Données protégées, espace de confiance."
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      <Header
        currentPage="landing"
        onNavigate={onNavigate}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />

      {/* ─── HERO ─── */}
      <section className={`relative overflow-hidden py-20 md:py-32 ${theme === "dark"
          ? "bg-gradient-to-b from-black via-red-950/20 to-black"
          : "bg-gradient-to-b from-gray-50 via-red-50 to-white"
        }`}>
        {/* Glow blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 left-10 w-96 h-96 ${theme === "dark" ? "bg-red-600/20" : "bg-red-300/20"} rounded-full blur-3xl animate-pulse-glow`} />
          <div className={`absolute bottom-20 right-10 w-96 h-96 ${theme === "dark" ? "bg-red-800/20" : "bg-red-200/20"} rounded-full blur-3xl animate-pulse-glow`} style={{ animationDelay: "1s" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-600/40 bg-red-600/10 mb-8">
              <GraduationCap className="w-4 h-4 text-red-400" />
              <span className={`text-sm font-medium ${theme === "dark" ? "text-red-300" : "text-red-700"}`}>
                Plateforme Universitaire · Étudiants &amp; Professeurs
              </span>
            </div>

            <h1 className={`text-4xl md:text-6xl font-bold mb-6 leading-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              <span className="gradient-text">Apprenez ensemble,</span>
              <br />
              <span className={theme === "dark" ? "text-white" : "text-gray-900"}>en temps réel</span>
            </h1>

            <p className={`text-lg md:text-xl mb-4 max-w-2xl mx-auto ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              WithYou est la plateforme éducative qui connecte professeurs et étudiants
              autour de vidéos pédagogiques synchronisées — cours, TD, révisions.
            </p>
            <p className={`text-lg mb-10 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
              Réservé aux membres · 100% Gratuit · Sans publicité
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                onClick={() => onNavigate("signup")}
                className="bg-red-600 hover:bg-red-700 text-white group px-8"
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                Créer mon compte
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate("signin")}
                className={theme === "dark"
                  ? "border-red-600/40 text-red-400 hover:bg-red-600/10 px-8"
                  : "border-red-400 text-red-600 hover:bg-red-50 px-8"
                }
              >
                Se connecter
              </Button>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-3 gap-6 max-w-lg mx-auto py-6 border-t border-b ${theme === "dark" ? "border-zinc-800" : "border-gray-200"} mb-14`}>
              {[
                { value: "100%", label: "Gratuit" },
                { value: "Temps réel", label: "Synchronisation" },
                { value: "∞", label: "Salons de cours" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className={`text-xl font-bold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>{s.value}</div>
                  <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Preview image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl max-w-3xl mx-auto border border-red-900/20">
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="Cours universitaire en ligne"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── POUR QUI ─── */}
      <section className={`py-20 ${theme === "dark" ? "bg-zinc-950" : "bg-gray-50"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Conçu pour vous
            </h2>
            <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Des outils adaptés aux besoins de chaque acteur de l'université
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Étudiants */}
            <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"} hover:border-red-600 transition-all duration-300`}>
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-red-600/20 rounded-xl flex items-center justify-center mb-5">
                  <BookOpen className="w-7 h-7 text-red-500" />
                </div>
                <h3 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  🎓 Pour les Étudiants
                </h3>
                <ul className="space-y-3">
                  {[
                    "Suivez les cours en direct, où que vous soyez",
                    "Posez vos questions pendant la séance",
                    "Révisez en groupe dans des salons privés",
                    "Répondez aux quiz et sondages du professeur",
                    "Accédez aux replays des cours enregistrés",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Professeurs */}
            <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"} hover:border-red-600 transition-all duration-300`}>
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-red-600/20 rounded-xl flex items-center justify-center mb-5">
                  <GraduationCap className="w-7 h-7 text-red-500" />
                </div>
                <h3 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  📚 Pour les Professeurs
                </h3>
                <ul className="space-y-3">
                  {[
                    "Diffusez vos cours vidéo à toute la promotion",
                    "Contrôlez la lecture pour tous les participants",
                    "Modérez les échanges en temps réel",
                    "Lancez des sondages et quiz interactifs",
                    "Gérez les rôles et droits de chaque étudiant",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── FONCTIONNALITÉS ─── */}
      <section className={`py-20 ${theme === "dark" ? "bg-black" : "bg-white"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Fonctionnalités
            </h2>
            <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Tout ce dont vous avez besoin pour enseigner et apprendre ensemble
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-gray-50 border-gray-200"} hover:border-red-600 transition-all duration-300 hover:-translate-y-1`}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className={`text-base font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section className={`py-20 ${theme === "dark"
          ? "bg-gradient-to-b from-black via-red-950/10 to-black"
          : "bg-gradient-to-b from-white via-red-50/30 to-gray-50"
        }`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Comment ça marche
            </h2>
            <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Démarrez en 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: 1,
                title: "Inscrivez-vous",
                desc: "Créez votre compte étudiant ou professeur en quelques secondes avec votre email universitaire.",
                img: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                alt: "Inscription universitaire",
              },
              {
                step: 2,
                title: "Rejoignez un Salon",
                desc: "Rejoignez le salon de cours de votre matière ou créez-en un pour votre groupe de révision.",
                img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                alt: "Rejoindre un cours",
              },
              {
                step: 3,
                title: "Apprenez Ensemble",
                desc: "Regardez, posez des questions, répondez aux quiz — tout en temps réel avec vos camarades.",
                img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                alt: "Apprendre ensemble",
              },
            ].map(({ step, title, desc, img, alt }) => (
              <div key={step} className="text-center">
                <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                  <img src={img} alt={alt} className="w-full h-48 object-cover" />
                </div>
                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
                  {step}
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {title}
                </h3>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className={`py-20 ${theme === "dark"
          ? "bg-gradient-to-b from-black via-red-950/20 to-black"
          : "bg-gradient-to-b from-gray-50 via-red-50 to-white"
        }`}>
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Rejoignez WithYou dès aujourd'hui
          </h2>
          <p className={`text-lg mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            La plateforme éducative qui transforme l'expérience d'apprentissage universitaire
            pour les étudiants et les professeurs.
          </p>
          <p className={`text-lg mb-10 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
            Inscription rapide · Totalement gratuit · Accès universitaire sécurisé
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => onNavigate("signup")}
              className="bg-red-600 hover:bg-red-700 text-white group px-8"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Je m'inscris
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate("signin")}
              className={theme === "dark"
                ? "border-red-600/40 text-red-400 hover:bg-red-600/10 px-8"
                : "border-red-400 text-red-600 hover:bg-red-50 px-8"
              }
            >
              J'ai déjà un compte
            </Button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} theme={theme} />
    </div>
  );
}

export default LandingPage;