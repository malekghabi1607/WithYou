/**
 * Projet : WithYou
 * Fichier : components/layouts/Header.tsx
 *
 * Description :
 * Composant d’en-tête principal de l’application.
 * Contient :
 *  - Le logo
 *  - La navigation
 *  - L’accès au compte utilisateur
 *
 * Inclus automatiquement via MainLayout.tsx.
 */

import { Play } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-900">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <Play size={16} fill="white" className="text-white" />
          </div>
          <span className="text-xl font-bold">WITHYOU</span>
        </div>
        <nav className="flex items-center gap-6">
          <button className="text-gray-300 hover:text-white transition-colors">
            Connexion
          </button>
          <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md transition-colors font-medium">
            S'inscrire
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;