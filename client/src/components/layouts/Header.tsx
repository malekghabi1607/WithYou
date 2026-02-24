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

import { useState } from "react";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";
import { 
  User, 
  LogOut, 
  Video, 
  Home,
  Settings,
  Moon,
  Sun,
  Menu,
  X
} from "lucide-react";

interface HeaderProps {
  currentUser?: { email: string; name: string } | null;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function Header({ 
  currentUser, 
  currentPage, 
  onNavigate, 
  onLogout,
  theme = "dark",
  onThemeToggle 
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={`sticky top-0 z-50 ${theme === "dark" ? "bg-black/95" : "bg-white/95"} backdrop-blur-md border-b ${theme === "dark" ? "border-red-900/20" : "border-gray-200"} shadow-lg`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button onClick={() => onNavigate(currentUser ? "salons" : "home")} className="focus:outline-none">
              <Logo size="sm" theme={theme} />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {currentUser && (
                <button
                  onClick={() => onNavigate("salons")}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    currentPage === "salons"
                      ? "text-red-500"
                      : theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-black"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Accueil
                </button>
              )}
              <button
                onClick={() => onNavigate("public-rooms")}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  currentPage === "public-rooms" || currentPage === "create-room" || currentPage === "join-room"
                    ? "text-red-500"
                    : theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-black"
                }`}
              >
                <Video className="w-4 h-4" />
                Salons publics
              </button>
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            {onThemeToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onThemeToggle}
                className={`hidden md:flex ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
            )}

            {currentUser ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate("profile")}
                    className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {currentUser.name}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-red-400 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`md:hidden ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
              </>
            ) : (
              <>
                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate("signin")}
                    className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                  >
                    Connexion
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onNavigate("signup")}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    S&apos;inscrire
                  </Button>
                </div>

                {/* Mobile Menu Button for non-logged users */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`md:hidden ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && currentUser && (
          <div className={`md:hidden border-t ${theme === 'dark' ? 'border-red-900/20' : 'border-gray-200'} py-4 animate-slide-in-right`}>
            <nav className="flex flex-col gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  onNavigate("salons");
                  setMobileMenuOpen(false);
                }}
                className={`justify-start ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
              >
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  onNavigate("public-rooms");
                  setMobileMenuOpen(false);
                }}
                className={`justify-start ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
              >
                <Video className="w-4 h-4 mr-2" />
                Salons publics
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  onNavigate("profile");
                  setMobileMenuOpen(false);
                }}
                className={`justify-start ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
              >
                <User className="w-4 h-4 mr-2" />
                Profil
              </Button>
              {onThemeToggle && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    onThemeToggle();
                    setMobileMenuOpen(false);
                  }}
                  className={`justify-start ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Mode clair
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Mode sombre
                    </>
                  )}
                </Button>
              )}
              <div className={`border-t ${theme === 'dark' ? 'border-red-900/20' : 'border-gray-200'} mt-2 pt-2`}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    onLogout?.();
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start text-red-400 hover:text-red-300 w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </nav>
          </div>
        )}

        {/* Mobile Menu for non-logged users */}
        {mobileMenuOpen && !currentUser && (
          <div className={`md:hidden border-t ${theme === 'dark' ? 'border-red-900/20' : 'border-gray-200'} py-4 animate-slide-in-right`}>
            <nav className="flex flex-col gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  onNavigate("public-rooms");
                  setMobileMenuOpen(false);
                }}
                className={`justify-start ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
              >
                <Video className="w-4 h-4 mr-2" />
                Salons publics
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  onNavigate("signin");
                  setMobileMenuOpen(false);
                }}
                className={`justify-start ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
              >
                Connexion
              </Button>
              <Button
                onClick={() => {
                  onNavigate("signup");
                  setMobileMenuOpen(false);
                }}
                className="justify-start bg-red-600 hover:bg-red-700 text-white"
              >
                S&apos;inscrire
              </Button>
              {onThemeToggle && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    onThemeToggle();
                    setMobileMenuOpen(false);
                  }}
                  className={`justify-start ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Mode clair
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Mode sombre
                    </>
                  )}
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
