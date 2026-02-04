/**
 * Projet : WithYou
 * Fichier : components/layouts/Footer.tsx
 *
 * Description :
 * Pied de page global affiché sur les pages publiques.
 * Peut contenir :
 *  - Mentions légales
 *  - Liens utilitaires
 *  - Informations sur le projet
 */
import { Logo } from "../ui/Logo";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

interface FooterProps {
  onNavigate: (page: string) => void;
  theme?: "light" | "dark";
}

export function Footer({ onNavigate, theme = "dark" }: FooterProps) {
  return (
    <footer className={`${theme === "dark" ? "bg-black border-red-900/20" : "bg-gray-50 border-gray-200"} border-t mt-auto`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Logo size="md" theme={theme} className="mb-4" />
            <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-700"} mb-4 max-w-md`}>
              WithYou - Regardez des vidéos ensemble, où que vous soyez. 
              Créez des moments inoubliables avec vos proches à distance.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className={`${theme === "dark" ? "text-white" : "text-gray-900"} mb-4`}>Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onNavigate("home")}
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} hover:text-red-500 transition-colors text-sm`}
                >
                  Accueil
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("about")}
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} hover:text-red-500 transition-colors text-sm`}
                >
                  À propos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("contact")}
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} hover:text-red-500 transition-colors text-sm`}
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className={`${theme === "dark" ? "text-white" : "text-gray-900"} mb-4`}>Légal</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onNavigate("privacy")}
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} hover:text-red-500 transition-colors text-sm`}
                >
                  Confidentialité
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("terms")}
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} hover:text-red-500 transition-colors text-sm`}
                >
                  Conditions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("faq")}
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} hover:text-red-500 transition-colors text-sm`}
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t ${theme === "dark" ? "border-red-900/20" : "border-gray-200"} pt-8 flex flex-col md:flex-row justify-between items-center gap-4`}>
          <p className={`${theme === "dark" ? "text-gray-500" : "text-gray-600"} text-sm`}>
            © 2025 WithYou. Tous droits réservés.
          </p>
          <div className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-500" : "text-gray-600"} text-sm`}>
            <Mail className="w-4 h-4" />
            <a href="mailto:contact@withyou.com" className="hover:text-red-500 transition-colors">
              contact@withyou.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}