/**
 * Projet : WithYou
 * Fichier : pages/RoomLoadingPage.tsx
 *
 * Description :
 * Page de transition affichée lors de l’entrée d’un utilisateur dans un salon.
 * Elle simule le chargement des différents services nécessaires au
 * visionnage collaboratif en temps réel.
 *
 * Cette page affiche une animation progressive représentant :
 *  - Le chargement de la vidéo
 *  - La connexion au système de chat
 *  - La vérification des permissions utilisateur
 *  - La synchronisation globale du salon
 *
 * Objectif :
 * - Améliorer l’expérience utilisateur pendant le temps de préparation
 * - Éviter une transition brutale entre les pages
 * - Donner un retour visuel clair sur l’état du chargement
 *
 * Fonctionnement :
 * - Les étapes de chargement sont affichées séquentiellement
 * - Une barre de progression reflète l’avancement global
 * - Une fois toutes les étapes terminées, l’utilisateur est automatiquement
 *   redirigé vers la page du salon
 *
 * Cette page ne contient aucune logique métier réelle côté serveur ;
 * elle simule uniquement le comportement attendu en attendant
 * l’intégration complète du backend.
 */



import { useEffect, useState } from "react";
import { Video, MessageCircle, Shield, CheckCircle } from "lucide-react";

interface RoomLoadingPageProps {
  onLoadComplete: () => void;
}

const loadingSteps = [
  { id: 1, text: "Chargement de la vidéo…", icon: Video, delay: 500 },
  { id: 2, text: "Connexion au chat…", icon: MessageCircle, delay: 1000 },
  { id: 3, text: "Vérification des permissions…", icon: Shield, delay: 1500 },
  { id: 4, text: "Synchronisation…", icon: CheckCircle, delay: 2000 }
];

export function RoomLoadingPage({ onLoadComplete }: RoomLoadingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < loadingSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, loadingSteps[currentStep]?.delay || 500);

      return () => clearTimeout(timer);
    } else {
      const finalTimer = setTimeout(() => {
        onLoadComplete();
      }, 500);

      return () => clearTimeout(finalTimer);
    }
  }, [currentStep, onLoadComplete]);

  return (
    <div className="h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Netflix Red Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/30 to-black opacity-80"></div>
      
      {/* Animated Red Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>

      <div className="text-center relative z-10">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-red-600/50 animate-pulse-glow">
            <Video className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-white" style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "0.05em" }}>
            WithYou
          </h2>
        </div>

        {/* Loading Steps */}
        <div className="space-y-4 mb-8">
          {loadingSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isCompleted || isCurrent ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 shadow-lg shadow-green-500/50'
                      : isCurrent
                      ? 'bg-red-600 animate-pulse shadow-lg shadow-red-600/50'
                      : 'bg-zinc-800 border border-zinc-700'
                  }`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-white ${isCurrent ? 'font-semibold' : ''}`}>
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar - Netflix Style */}
        <div className="w-80 h-2 bg-zinc-800 rounded-full overflow-hidden mx-auto shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 transition-all duration-500 ease-out shadow-lg shadow-red-600/50"
            style={{ width: `${(currentStep / loadingSteps.length) * 100}%` }}
          />
        </div>

        <p className="text-gray-400 mt-6 text-sm animate-pulse">
          Préparation du salon...
        </p>
      </div>
    </div>
  );
}
