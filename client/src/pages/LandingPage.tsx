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
// client/src/pages/LandingPage.tsx
import { Play, MessageCircle, Users, Crown, Shield, Zap } from 'lucide-react';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';


const LandingPage = () => {
  return (
    <div className="bg-black text-white min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Partagez vos moments vidéo{' '}
            <span className="text-red-600">avec ceux que vous aimez</span>
          </h1>
          <p className="text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
            Une plateforme de visionnage collaboratif en temps réel. Synchronisez vos
            vidéos, chattez et profitez ensemble, même à distance.
          </p>
          <p className="text-white font-medium text-lg mb-12">
            100% Gratuit! • Sans publicité • Sans limites
          </p>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-3xl mx-auto">
            <img
              src="/src/assets/images/landing/hero.jpg"
              alt="Personnes regardant ensemble"
              className="w-full h-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=1200';
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Fonctionnalités</h2>
            <p className="text-gray-400 text-lg">
              Tout ce dont vous avez besoin pour regarder ensemble
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Synchronisation Parfaite */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-red-600 transition-colors group">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                <Play size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Synchronisation Parfaite</h3>
              <p className="text-gray-400">
                Regardez des vidéos en parfaite synchronisation avec vos amis, peu
                importe la distance.
              </p>
            </div>

            {/* Chat en Direct */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-red-600 transition-colors group">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                <MessageCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Chat en Direct</h3>
              <p className="text-gray-400">
                Discutez en temps réel, partagez des réactions émoji et partagez vos impressions.
              </p>
            </div>

            {/* Salons Illimités */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-red-600 transition-colors group">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                <Users size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Salons Illimités</h3>
              <p className="text-gray-400">
                Créez autant de salons que vous voulez, publics ou privés.
              </p>
            </div>

            {/* Contrôle Administrateur */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-red-600 transition-colors group">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                <Crown size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Contrôle Administrateur</h3>
              <p className="text-gray-400">
                Gérez les permissions, modérez les membres et contrôlez le lecteur.
              </p>
            </div>

            {/* Sécurité & Privé */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-red-600 transition-colors group">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                <Shield size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sécurité & Privé</h3>
              <p className="text-gray-400">
                Vos données sont protégées. Salons privés avec mot de passe.
              </p>
            </div>

            {/* Ultra Rapide */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-red-600 transition-colors group">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                <Zap size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Ultra Rapide</h3>
              <p className="text-gray-400">
                Temps de latence minimal pour une expérience fluide et agréable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-6 bg-black">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Comment ça marche</h2>
            <p className="text-gray-400 text-lg">Commencez en 3 étapes simples</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-6 rounded-xl overflow-hidden shadow-xl">
                <img
                  src="/src/assets/images/landing/step1.jpg"
                  alt="Créez un Salon"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800';
                  }}
                />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Créez un Salon</h3>
              <p className="text-gray-400">
                Créez votre salon personnalisé en quelques clics
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-6 rounded-xl overflow-hidden shadow-xl">
                <img
                  src="/src/assets/images/landing/step2.jpg"
                  alt="Invitez vos Amis"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800';
                  }}
                />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Invitez vos Amis</h3>
              <p className="text-gray-400">
                Partagez le lien et invitez vos proches
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-6 rounded-xl overflow-hidden shadow-xl">
                <img
                  src="/src/assets/images/landing/step3.jpg"
                  alt="Regardez Ensemble"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=800';
                  }}
                />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Regardez Ensemble</h3>
              <p className="text-gray-400">
                Profitez de moments inoubliables ensemble
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Rejoignez WithYou dès maintenant
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            La meilleure plateforme pour regarder vos vidéos préférées avec vos amis, où qu'ils
            soient
          </p>
          <p className="text-red-600 font-medium text-lg mb-8">
            Inscription rapide • Totalement gratuit • Aucune carte bancaire
          </p>
          <button className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-lg text-lg font-bold transition-colors shadow-lg hover:shadow-red-600/50">
            Commencer Gratuitement
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
