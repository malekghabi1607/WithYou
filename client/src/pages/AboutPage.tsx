/**
 * Projet : WithYou – Plateforme de visionnage collaboratif
 * Fichier : pages/AboutPage.tsx
 *
 * Description :
 * Page d’information "À propos".
 * Présente :
 *    - Le concept de la plateforme
 *    - Les fonctionnalités principales
 *    - Les objectifs du projet
 *
 * Cette page est accessible depuis les pages publiques via la navigation.
 */

import { Header } from "../components/layouts/Header";
import { Footer } from "../components/layouts/Footer";
import { Card, CardContent } from "../components/ui/card";
import { Users, Heart, Zap, Globe } from "lucide-react";

interface AboutPageProps {
  onNavigate: (page: string) => void;
  currentUser?: { email: string; name: string } | null;
  onLogout?: () => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function AboutPage({ 
  onNavigate, 
  currentUser, 
  onLogout, 
  theme = "dark", 
  onThemeToggle 
}: AboutPageProps) {
  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      <Header 
        currentPage="about" 
        onNavigate={onNavigate}
        currentUser={currentUser}
        onLogout={onLogout}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className={`text-5xl md:text-6xl mb-6 text-center font-display ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              À Propos de  WITHYOU
            </h1>
            <p className={`text-xl text-center mb-16 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Notre mission est de rapprocher les gens, où qu&apos;ils soient
            </p>

            <Card className={theme === "dark" ? "bg-zinc-900 border-zinc-800 mb-12" : "bg-white border-gray-200 mb-12"}>
              <CardContent className="p-8">
                <h2 className={`text-3xl mb-4 font-display ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  NOTRE HISTOIRE
                </h2>
                <p className={`mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  WithYou est né d&apos;un constat simple : la distance ne devrait pas être un obstacle pour partager des moments ensemble. En 2024, nous avons lancé cette plateforme pour permettre à des millions de personnes de regarder des vidéos ensemble, en temps réel, peu importe où elles se trouvent.
                </p>
                <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                  Aujourd&apos;hui, WithYou compte plus de 10 000 utilisateurs actifs qui créent chaque jour des milliers de salons pour partager des films, des séries, des concerts et bien plus encore.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className={theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    theme === "dark" ? "bg-red-600/20" : "bg-red-100"
                  }`}>
                    <Users className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className={`text-xl mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Communauté</h3>
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                    Une communauté bienveillante de passionnés qui partagent leurs moments préférés.
                  </p>
                </CardContent>
              </Card>

              <Card className={theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    theme === "dark" ? "bg-red-600/20" : "bg-red-100"
                  }`}>
                    <Heart className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className={`text-xl mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Passion</h3>
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                    Nous sommes passionnés par la technologie et les connexions humaines.
                  </p>
                </CardContent>
              </Card>

              <Card className={theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    theme === "dark" ? "bg-red-600/20" : "bg-red-100"
                  }`}>
                    <Zap className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className={`text-xl mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Innovation</h3>
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                    Nous innovons constamment pour offrir la meilleure expérience possible.
                  </p>
                </CardContent>
              </Card>

              <Card className={theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    theme === "dark" ? "bg-red-600/20" : "bg-red-100"
                  }`}>
                    <Globe className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className={`text-xl mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Global</h3>
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                    Disponible partout dans le monde, pour tout le monde.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} theme={theme} />
    </div>
  );
}
