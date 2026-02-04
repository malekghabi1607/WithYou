/**
 * ContactPage
 * -----------
 * Cette page permet aux utilisateurs de contacter l’équipe WithYou
 * via un formulaire de contact dédié.
 *
 * Fonctionnalités principales :
 * - Formulaire de contact avec nom, email, sujet et message
 * - Validation simple des champs requis
 * - Affichage d’un message de confirmation après l’envoi
 * - Informations de contact (email, téléphone, adresse)
 *
 * La page est intégrée à la navigation globale avec Header et Footer
 * et prend en charge le thème clair / sombre.
 */
import { useState } from "react";
import { Header } from "../components/layouts/Header";
import { Footer } from "../components/layouts/Footer";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

interface ContactPageProps {
  onNavigate: (page: string) => void;
  currentUser?: { email: string; name: string } | null;
  onLogout?: () => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function ContactPage({ onNavigate, currentUser, onLogout, theme = "dark", onThemeToggle }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message envoyé avec succès !");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      <Header currentPage="contact" onNavigate={onNavigate} theme={theme} />

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className={`text-5xl md:text-6xl mb-6 text-center font-display ${theme === "dark" ? "text-white" : "text-black"}`}>
              CONTACTEZ-NOUS
            </h1>
            <p className={`text-xl text-center mb-16 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Une question ? N'hésitez pas à nous contacter
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}`}>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>Nom</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className={theme === "dark" ? "bg-zinc-800 border-red-900/30 text-white" : "bg-white border-gray-300"}
                      />
                    </div>
                    <div>
                      <Label className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className={theme === "dark" ? "bg-zinc-800 border-red-900/30 text-white" : "bg-white border-gray-300"}
                      />
                    </div>
                    <div>
                      <Label className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>Sujet</Label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className={theme === "dark" ? "bg-zinc-800 border-red-900/30 text-white" : "bg-white border-gray-300"}
                      />
                    </div>
                    <div>
                      <Label className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>Message</Label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={5}
                        className={theme === "dark" ? "bg-zinc-800 border-red-900/30 text-white" : "bg-white border-gray-300"}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}`}>
                  <CardContent className="p-6">
                    <Mail className="w-8 h-8 text-red-500 mb-4" />
                    <h3 className={`text-xl mb-2 ${theme === "dark" ? "text-white" : "text-black"}`}>Email</h3>
                    <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      contact@withyou.com
                    </p>
                  </CardContent>
                </Card>

                <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}`}>
                  <CardContent className="p-6">
                    <Phone className="w-8 h-8 text-red-500 mb-4" />
                    <h3 className={`text-xl mb-2 ${theme === "dark" ? "text-white" : "text-black"}`}>Téléphone</h3>
                    <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      +33 1 23 45 67 89
                    </p>
                  </CardContent>
                </Card>

                <Card className={`${theme === "dark" ? "bg-zinc-900 border-red-900/20" : "bg-white border-gray-200"}`}>
                  <CardContent className="p-6">
                    <MapPin className="w-8 h-8 text-red-500 mb-4" />
                    <h3 className={`text-xl mb-2 ${theme === "dark" ? "text-white" : "text-black"}`}>Adresse</h3>
                    <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      123 Avenue des Champs-Élysées<br />
                      75008 Paris, France
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} theme={theme} />
    </div>
  );
}