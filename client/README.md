# 🎬 WithYou – Front-End

Plateforme de visionnage collaboratif en temps réel  
Développé en React + TypeScript + Tailwind CSS + Vite

---

## 🚀 Présentation du Projet

**WithYou** est une plateforme web permettant à plusieurs utilisateurs de regarder des vidéos ensemble en temps réel, tout en échangeant via un chat intégré, en gérant une playlist collaborative, et en interagissant via des sondages.

Ce dépôt correspond à **la partie Front-End** du projet.

Il est conçu pour être entièrement modulable, réutilisable et scalable grâce à une architecture claire et professionnelle (pages / components / features / api).

---

## 🧱 Technologies Principales

|Technologie|Rôle|
|---|---|
|**React**|Construction des interfaces interactives|
|**TypeScript**|Sécurisation du code & typage statique|
|**Vite**|Build ultra rapide + Dev Server|
|**Tailwind CSS**|Système de design & styles utilitaires|
|**React Router**|Gestion des pages et de la navigation|
|**API Laravel**|Backend auquel le Front communique|

---

## 📁 Structure du Projet (Front-End)

L'architecture suit une séparation claire des responsabilités :

client/                                              # Dossier racine du front-end WithYou
│
├── src/                                             # Code source principal de l’application React
│   │
│   ├── api/                                         # Couche de communication avec le backend
│   │   ├── auth.ts                                  # Fonctions d’authentification (login, register, logout)
│   │   ├── rooms.ts                                 # Fonctions API pour gérer les salles (playlist, chat, sondages)
│   │   └── index.ts                                 # Point d’export central des modules API
│   │
│   ├── assets/                                      # Ressources statiques utilisées par l’interface
│   │   ├── icons/                                   # Icônes SVG de l’interface
│   │   ├── images/                                  # Images et illustrations du site
│   │   └── logos/                                   # Logos officiels du projet
│   │
│   ├── components/                                  # Composants UI et logique métier
│   │   │
│   │   ├── layouts/                                 # Composants de structure globale
│   │   │   ├── Header.tsx                           # Barre de navigation en haut des pages
│   │   │   ├── Footer.tsx                           # Pied de page en bas des pages
│   │   │   └── MainLayout.tsx                       # Layout principal qui englobe les pages publiques
│   │   │
│   │   ├── room/                                    # Composants liés à la salle collaborative
│   │   │   ├── ChatSection.tsx                      # Interface du chat en temps réel
│   │   │   ├── EmptyStates.tsx                      # Messages affichés quand une section est vide
│   │   │   ├── FunctionalChat.tsx                   # Logique interne du chat (envoi / réception)
│   │   │   ├── ParticipantsPermissionsPanel.tsx     # Gestion des permissions des participants
│   │   │   ├── PlaylistSection.tsx                  # Affichage et gestion de la playlist
│   │   │   ├── PollSection.tsx                      # Affichage et gestion des sondages
│   │   │   ├── RoomInfoPanel.tsx                    # Informations générales de la salle
│   │   │   ├── RoomRatingPanel.tsx                  # Système de notation de la salle ou des vidéos
│   │   │   ├── VideoManagementPanel.tsx             # Gestion des vidéos (admin)
│   │   │   ├── VideoVotePanel.tsx                   # Interface de vote sur les vidéos
│   │   │   └── YoutubePlayer.tsx                    # Lecteur YouTube synchronisé
│   │   │
│   │   ├── settings/                                # Réglages et configuration de la salle
│   │   │   ├── RoomInfoSettings.tsx                 # Modifier nom et description de la salle
│   │   │   ├── RoomMembersSettings.tsx              # Gérer les membres de la salle
│   │   │   ├── RoomPermissionsSettings.tsx          # Gérer les rôles et permissions
│   │   │   ├── RoomPlaylistSettings.tsx             # Configurer la playlist
│   │   │   └── RoomPollsSettings.tsx                # Configurer les sondages
│   │   │
│   │   └── ui/                                      # Design system (composants génériques réutilisables)
│   │       ├── accordion.tsx                        # Composant accordéon
│   │       ├── alert.tsx                            # Composant d’alerte simple
│   │       ├── alert-dialog.tsx                     # Fenêtre d’alerte modale
│   │       ├── aspect-ratio.tsx                     # Gestion du ratio des éléments (vidéo, images)
│   │       ├── avatar.tsx                           # Avatar utilisateur
│   │       ├── badge.tsx                            # Badge d’information
│   │       ├── breadcrumb.tsx                       # Fil d’Ariane de navigation
│   │       ├── Button.tsx                           # Bouton générique stylisé
│   │       ├── calendar.tsx                         # Sélecteur de date
│   │       ├── card.tsx                             # Carte UI générique
│   │       ├── carousel.tsx                         # Carousel d’éléments
│   │       ├── chart.tsx                            # Composants de graphiques
│   │       ├── Checkbox.tsx                         # Case à cocher stylisée
│   │       ├── collapsible.tsx                      # Section repliable
│   │       ├── command.tsx                          # Command palette / recherche rapide
│   │       ├── context-menu.tsx                     # Menu clic droit
│   │       ├── dialog.tsx                           # Fenêtre de dialogue générique
│   │       ├── drawer.tsx                           # Panneau coulissant latéral
│   │       ├── dropdown-menu.tsx                    # Menu déroulant
│   │       ├── form.tsx                             # Gestion des formulaires
│   │       ├── hover-card.tsx                       # Carte affichée au survol
│   │       ├── input-otp.tsx                        # Champ pour code à usage unique
│   │       ├── Input.tsx                            # Champ de saisie texte générique
│   │       ├── label.tsx                            # Label de formulaire
│   │       ├── Logo.tsx                             # Logo du projet
│   │       ├── menubar.tsx                          # Barre de menu
│   │       ├── navigation-menu.tsx                  # Menu de navigation
│   │       ├── pagination.tsx                       # Pagination des listes
│   │       ├── popover.tsx                          # Bulle d’information contextuelle
│   │       ├── progress.tsx                         # Barre de progression
│   │       ├── radio-group.tsx                      # Groupe de boutons radio
│   │       ├── resizable.tsx                        # Composants redimensionnables
│   │       ├── scroll-area.tsx                      # Zone avec scroll personnalisé
│   │       ├── separator.tsx                        # Séparateur visuel
│   │       ├── sheet.tsx                            # Panneau type “sheet”
│   │       ├── sidebar.tsx                          # Barre latérale
│   │       ├── skeleton.tsx                         # Chargement skeleton
│   │       ├── slider.tsx                           # Curseur de sélection
│   │       ├── sonner.tsx                           # Notifications toast
│   │       ├── switch.tsx                           # Interrupteur on/off
│   │       ├── table.tsx                            # Table de données
│   │       ├── tabs.tsx                             # Onglets
│   │       ├── textarea.tsx                         # Zone de texte multiligne
│   │       ├── toggle.tsx                           # Bouton bascule
│   │       ├── toggle-group.tsx                     # Groupe de boutons bascule
│   │       ├── tooltip.tsx                          # Infobulle au survol
│   │       ├── use-mobile.ts                        # Hook pour détecter le mobile
│   │       └── utils.ts                             # Fonctions utilitaires UI
│   │
│   ├── pages/                                       # Pages correspondant aux routes de l’application
│   │   ├── AboutPage.tsx                            # Page “À propos”
│   │   ├── AccountConfirmedPage.tsx                 # Confirmation de compte
│   │   ├── AdminVideoManagement.tsx                 # Gestion admin des vidéos
│   │   ├── ContactPage.tsx                          # Page de contact
│   │   ├── CreateRoomPage.tsx                       # Création d’une salle
│   │   ├── EmailSentPage.tsx                        # Confirmation d’envoi d’email
│   │   ├── FAQPage.tsx                              # Questions fréquentes
│   │   ├── ForgotPasswordPage.tsx                   # Mot de passe oublié
│   │   ├── JoinRoomPage.tsx                         # Rejoindre une salle
│   │   ├── JoinWithCodePage.tsx                     # Rejoindre via un code
│   │   ├── LandingPage.tsx                          # Page d’accueil publique
│   │   ├── LeaveRoomDialog.tsx                      # Boîte de dialogue pour quitter une salle
│   │   ├── ManageVideosPage.tsx                     # Gestion des vidéos de la salle
│   │   ├── PrivacyPage.tsx                          # Politique de confidentialité
│   │   ├── ProfilePage.tsx                          # Profil utilisateur
│   │   ├── PublicRoomsPage.tsx                      # Liste des salles publiques
│   │   ├── RoomInfoPage.tsx                         # Informations sur une salle
│   │   ├── RoomLoadingPage.tsx                      # Écran de chargement de la salle
│   │   ├── RoomPage.tsx                             # Salle collaborative principale
│   │   ├── RoomRulesPage.tsx                        # Règles internes de la salle
│   │   ├── RoomSettingsPage.tsx                     # Réglages de la salle
│   │   ├── SalonsPage.tsx                           # Liste personnelle des salons
│   │   ├── SignInPage.tsx                           # Page de connexion
│   │   ├── SignUpPage.tsx                           # Page d’inscription
│   │   ├── TermsDialog.tsx                          # Fenêtre conditions d’utilisation
│   │   └── TermsPage.tsx                            # Page conditions d’utilisation
│   │
│   ├── routes/                                      # Définition des routes
│   │   └── AppRouter.tsx                            # Mapping URL → pages React
│   │
│   ├── styles/                                      # Styles globaux
│   │   └── globals.css                              # Fichier Tailwind et styles généraux
│   │
│   ├── utils/                                       # Fonctions utilitaires générales
│   │   ├── roomStorage.ts                           # Stockage local lié aux salles
│   │   ├── storage.ts                               # Stockage du token utilisateur
│   │   ├── utils.ts                                 # Fonctions utilitaires générales
│   │   ├── voteStorage.ts                           # Stockage local des votes
│   │   └── youtube.ts                               # Fonctions liées à l’API YouTube
│   │
│   ├── App.tsx                                      # Composant racine React
│   └── main.jsx                                     # Point d’entrée qui monte React dans le DOM
│
├── .env                                             # Variables d’environnement
├── .gitignore                                       # Fichiers ignorés par Git
├── eslint.config.js                                 # Configuration ESLint
├── index.html                                       # Template HTML principal
├── package.json                                     # Dépendances et scripts npm
├── package-lock.json                                # Versions exactes des dépendances
├── postcss.config.js                                # Configuration PostCSS
├── tailwind.config.js                               # Configuration Tailwind CSS
├── vite.config.ts                                   # Configuration du bundler Vite
└── README.md                                        # Documentation du projet

---

## ✨ Fonctionnalités Front-End

### 🔑 **Authentification**

- Connexion
- Inscription
- Confirmation email
- Gestion du token
- Intégration API Laravel

### 🎥 **Salle de visionnage collaborative**

- Player YouTube synchronisé (lecture/pause simultanées)
- Chat en temps réel
- Playlist collaborative
- Sondages
- Gestion des rôles et permissions

### ⚙️ **Réglages de salle**

- Modifier le nom / description
- Gérer les membres
- Gérer les permissions
- Configurer les sondages

### 🧭 **Pages publiques**

- Landing page
- Contact
- À propos
- Inscription/Connexion
- Rejoindre une salle via code

---

## 🔌 Communication avec le Backend (Laravel API)

Le Front consomme l’API Laravel via les modules :

- `api/auth.ts` → Login, Register, Logout, Reset Password
- `api/rooms.ts` → Création, jointure, playlist, sondages, infos salle

Les appels sont effectués avec `fetch()` / `axios` (selon le choix final).

Chaque module API renvoie des données typées (TypeScript) afin d'assurer une intégration propre.

---

## 🛠️ Installation & Lancement du Projet

### 1. Installer les dépendances

```bash
npm install
```

### 2. Lancer le serveur de développement

```bash
npm run dev

```

### 3. Build de production

```bash
npm run build

```

### 4. Aperçu du build

```bash
npm run preview

```

## 🔧 Configuration nécessaire

Créer un fichier .env à la racine du dossier client :

```bash
VITE_API_URL="http://localhost:8000"

```

## 🤝 Collaboration

👩🏻‍💻 Binôme Front-End (Meriem + Malek)

Les responsabilités sont séparées en deux axes :

### A. Design System & Layouts

• UI components (Button, Input…)
• Header, Footer, MainLayout
• Pages publiques (Landing, Login…)

B. Fonctionnalités avancées
• Chat
• Playlist
• Sondages
• RoomPage
• Settings avancés

Cette organisation permet un développement parallèle efficace.

⸻

## 🧪 Qualité du Code

Le projet respecte :
• Architecture modulaire claire
• Commentaires professionnels pour chaque fichier
• Composants réutilisables
• Responsabilités séparées (pages / ui / features / api)
• Bonnes pratiques React & TypeScript
• Tailwind utilisé proprement avec classes utilitaires

## 📝 Licence

Projet universitaire – Utilisation interne uniquement.
