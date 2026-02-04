/**
 * FAQPage
 * -------
 * Cette page présente la Foire Aux Questions (FAQ) de la plateforme WithYou.
 * Elle permet aux utilisateurs de trouver rapidement des réponses aux
 * questions les plus fréquentes concernant l’utilisation de l’application.
 *
 * Contenu principal :
 * - Questions organisées par catégories (compte, salons, vidéos, chat, etc.)
 * - Affichage interactif des réponses via des accordéons
 * - Section d’aide supplémentaire avec contact du support
 *
 * La page s’intègre à la navigation globale avec Header et Footer,
 * et prend en charge le thème clair / sombre.
 */
import { Header } from "../components/layouts/Header";
import { Footer } from "../components/layouts/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "../components/ui/button";

interface FAQPageProps {
  onNavigate: (page: string) => void;
  currentUser?: { email: string; name: string } | null;
  onLogout?: () => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function FAQPage({ 
  onNavigate, 
  currentUser, 
  onLogout,
  theme = "dark",
  onThemeToggle 
}: FAQPageProps) {
  const faqCategories = [
    {
      title: "Compte et Inscription",
      questions: [
        {
          q: "Comment créer un compte ?",
          a: "Cliquez sur le bouton 'S'inscrire' en haut de la page. Remplissez le formulaire avec votre nom, adresse email et mot de passe. Vous recevrez un email de confirmation pour activer votre compte."
        },
        {
          q: "J'ai oublié mon mot de passe, que faire ?",
          a: "Sur la page de connexion, cliquez sur 'Mot de passe oublié ?'. Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe."
        },
        {
          q: "Puis-je changer mon nom d'utilisateur ?",
          a: "Oui, vous pouvez modifier votre nom d'utilisateur depuis votre page de profil. Cliquez sur votre avatar en haut à droite, puis sur 'Profil' et modifiez vos informations."
        },
        {
          q: "Comment supprimer mon compte ?",
          a: "Depuis votre page de profil, faites défiler jusqu'à la section 'Zone dangereuse' et cliquez sur 'Supprimer mon compte'. Cette action est irréversible."
        }
      ]
    },
    {
      title: "Salons",
      questions: [
        {
          q: "Comment créer un salon ?",
          a: "Cliquez sur 'Salons' dans le menu, puis sur 'Créer un salon'. Donnez un nom à votre salon, choisissez s'il est public ou privé, et configurez les paramètres selon vos préférences."
        },
        {
          q: "Quelle est la différence entre un salon public et privé ?",
          a: "Un salon public est visible par tous les utilisateurs et n'importe qui peut le rejoindre. Un salon privé nécessite un code d'invitation pour y accéder et n'apparaît pas dans la liste des salons publics."
        },
        {
          q: "Comment inviter des amis dans mon salon ?",
          a: "Une fois dans votre salon, cliquez sur l'icône 'Partager' pour obtenir le code d'invitation ou le lien à partager avec vos amis."
        },
        {
          q: "Combien de personnes peuvent rejoindre un salon ?",
          a: "Un salon peut accueillir jusqu'à 50 personnes simultanément pour garantir une expérience optimale."
        },
        {
          q: "Comment quitter un salon ?"

,
          a: "Cliquez sur le bouton 'Quitter le salon' en haut à droite de l'écran. Vous pourrez rejoindre à nouveau le salon plus tard si vous le souhaitez."
        }
      ]
    },
    {
      title: "Vidéos et Playlists",
      questions: [
        {
          q: "Quelles plateformes vidéo sont supportées ?",
          a: "Actuellement, nous supportons YouTube. D'autres plateformes comme Vimeo et Dailymotion seront ajoutées prochainement."
        },
        {
          q: "Comment ajouter une vidéo à la playlist ?",
          a: "Dans le salon, cliquez sur l'onglet 'Playlist', puis sur 'Ajouter une vidéo'. Collez l'URL de la vidéo YouTube et cliquez sur 'Ajouter'."
        },
        {
          q: "Qui peut contrôler la lecture des vidéos ?",
          a: "Par défaut, seul le créateur du salon et les modérateurs peuvent contrôler la lecture. Le créateur peut activer le contrôle collaboratif dans les paramètres du salon."
        },
        {
          q: "Les vidéos sont-elles synchronisées pour tous ?",
          a: "Oui, toutes les vidéos sont parfaitement synchronisées pour tous les participants du salon. Si quelqu'un met en pause, tout le monde voit la pause."
        }
      ]
    },
    {
      title: "Chat et Communication",
      questions: [
        {
          q: "Comment envoyer un message dans le chat ?",
          a: "Tapez votre message dans la zone de texte en bas du chat et appuyez sur Entrée ou cliquez sur le bouton d'envoi."
        },
        {
          q: "Puis-je mentionner quelqu'un dans le chat ?",
          a: "Oui, utilisez @ suivi du nom d'utilisateur pour mentionner quelqu'un. Par exemple : @JohnDoe"
        },
        {
          q: "Comment signaler un message inapproprié ?",
          a: "Passez votre souris sur le message, cliquez sur les trois points et sélectionnez 'Signaler'. Notre équipe examinera le signalement."
        },
        {
          q: "Puis-je bloquer un utilisateur ?",
          a: "Oui, cliquez sur le nom d'utilisateur, puis sur 'Bloquer'. Vous ne verrez plus ses messages et il ne pourra plus vous contacter."
        }
      ]
    },
    {
      title: "Sondages",
      questions: [
        {
          q: "Comment créer un sondage ?",
          a: "Dans le salon, cliquez sur l'onglet 'Sondages', puis sur 'Créer un sondage'. Entrez votre question et les options de réponse."
        },
        {
          q: "Combien de temps dure un sondage ?",
          a: "Vous pouvez définir la durée du sondage lors de sa création (5 minutes, 15 minutes, 1 heure, ou jusqu'à fermeture manuelle)."
        },
        {
          q: "Les votes sont-ils anonymes ?",
          a: "Cela dépend des paramètres du sondage. Le créateur peut choisir de rendre les votes publics ou anonymes."
        }
      ]
    },
    {
      title: "Paramètres et Personnalisation",
      questions: [
        {
          q: "Comment changer de thème (clair/sombre) ?",
          a: "Cliquez sur l'icône soleil/lune en haut à droite de l'écran pour basculer entre le thème clair et sombre."
        },
        {
          q: "Puis-je désactiver les notifications ?",
          a: "Oui, dans les paramètres de votre profil, vous pouvez gérer toutes vos préférences de notifications."
        },
        {
          q: "Comment changer mon avatar ?",
          a: "Accédez à votre profil et cliquez sur votre avatar actuel. Vous pourrez télécharger une nouvelle image."
        }
      ]
    },
    {
      title: "Problèmes Techniques",
      questions: [
        {
          q: "La vidéo ne se charge pas, que faire ?",
          a: "Vérifiez votre connexion internet, actualisez la page, et assurez-vous que votre navigateur est à jour. Si le problème persiste, essayez un autre navigateur."
        },
        {
          q: "Le chat ne fonctionne pas",
          a: "Assurez-vous que votre connexion est stable. Déconnectez-vous puis reconnectez-vous. Si le problème persiste, contactez le support."
        },
        {
          q: "Quels navigateurs sont supportés ?",
          a: "Nous supportons les dernières versions de Chrome, Firefox, Safari et Edge. Pour une meilleure expérience, nous recommandons Chrome."
        },
        {
          q: "L'application est-elle disponible sur mobile ?",
          a: "Oui, notre plateforme est entièrement responsive et fonctionne sur mobile via votre navigateur. Une application native est en développement."
        }
      ]
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
      <Header
        currentUser={currentUser}
        currentPage="faq"
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
              theme === "dark" ? "bg-purple-900/30" : "bg-purple-100"
            } mb-6`}>
              <HelpCircle className={`w-10 h-10 ${theme === "dark" ? "text-purple-500" : "text-purple-600"}`} />
            </div>
            <h1 className="text-4xl mb-4">Foire Aux Questions (FAQ)</h1>
            <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Trouvez rapidement des réponses à vos questions
            </p>
          </div>

          {/* Questions par catégorie */}
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <Card 
                key={categoryIndex}
                className={theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`item-${categoryIndex}-${index}`}
                        className={theme === "dark" ? "border-gray-800" : "border-gray-200"}
                      >
                        <AccordionTrigger className={`text-left ${
                          theme === "dark" ? "hover:text-red-400" : "hover:text-red-600"
                        }`}>
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Section d'aide supplémentaire */}
          <Card className={`mt-12 ${
            theme === "dark" 
              ? "bg-gradient-to-br from-red-950/30 to-black border-red-900/30" 
              : "bg-gradient-to-br from-red-50 to-white border-red-200"
          }`}>
            <CardHeader className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                theme === "dark" ? "bg-red-900/30" : "bg-red-100"
              } mb-4 mx-auto`}>
                <MessageCircle className={`w-8 h-8 ${theme === "dark" ? "text-red-500" : "text-red-600"}`} />
              </div>
              <CardTitle className="text-2xl">Vous ne trouvez pas votre réponse ?</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                Notre équipe de support est là pour vous aider. N'hésitez pas à nous contacter !
              </p>
              <Button
                onClick={() => onNavigate("contact")}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                Nous Contacter
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer onNavigate={onNavigate} theme={theme} />
    </div>
  );
}