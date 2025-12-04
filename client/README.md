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

| Technologie        | Rôle |
|-------------------|------|
| **React**         | Construction des interfaces interactives |
| **TypeScript**    | Sécurisation du code & typage statique |
| **Vite**          | Build ultra rapide + Dev Server |
| **Tailwind CSS**  | Système de design & styles utilitaires |
| **React Router**  | Gestion des pages et de la navigation |
| **API Laravel**   | Backend auquel le Front communique |

---

## 📁 Structure du Projet (Front-End)

L'architecture suit une séparation claire des responsabilités :

```bash
client/
│
├── api/                                               # COUCHE 1 : Communication avec le backend Laravel
│   ├── auth.ts                                        # Appels API liés à l'authentification (login, register…)
│   ├── rooms.ts                                       # Appels API pour la gestion des salles (playlist, chat…)
│   └── index.ts                                       # Point d’entrée API (centralise et exporte tous les modules)
│
├── assets/                                            # Fichiers statiques visibles dans l’app
│   ├── icons/                                         # Icônes SVG utilisées dans l’interface
│   ├── images/                                        # Images, illustrations, backgrounds
│   └── logos/                                         # Logos officiels du projet WithYou
│
├── components/                                        # COUCHE 2 : Construction d’interface & logique métier
│   ├── layouts/                                       # Composants structurants (Header, Footer, Layouts)
│   │   ├── Header.tsx                                 # Barre de navigation globale
│   │   ├── Footer.tsx                                 # Pied de page global
│   │   └── MainLayout.tsx                             # Layout principal des pages publiques
│   │
│   ├── ui/                                            # DESIGN SYSTEM : Atomes & Molécules (réutilisables)
│   │   ├── Button.tsx                                 # Bouton générique stylisé Tailwind
│   │   ├── Card.tsx                                   # Carte UI de base
│   │   ├── Input.tsx                                  # Champ de formulaire réutilisable
│   │   ├── Modal.tsx                                  # Modale générique
│   │   └── Logo.tsx                                   # Composant d’affichage du logo
│   │
│   └── features/                                      # Logique métier par grand module
│       ├── auth/                                      # AUTHENTIFICATION
│       │   ├── LoginForm.tsx                          # Formulaire de connexion
│       │   └── RegisterForm.tsx                       # Formulaire d’inscription
│
│       ├── room/                                      # SALLE COLLABORATIVE (fonctionnalité principale)
│       │   ├── ChatSection.tsx                        # Panneau de chat en temps réel
│       │   ├── FunctionalChat.tsx                     # Logique interne du chat
│       │   ├── PlaylistSection.tsx                    # Gestion de playlist YouTube
│       │   ├── PollSection.tsx                        # Sondages de la salle
│       │   └── YouTubePlayer.tsx                      # Player vidéo synchronisé
│
│       ├── dialogs/                                   # MODALES SIMPLES & CONFIRMATIONS
│       │   ├── LeaveRoomDialog.tsx                    # Confirmation pour quitter une salle
│       │   └── TermsDialog.tsx                        # Conditions d’utilisation (CGU)
│
│       └── settings/                                  # RÉGLAGES DE LA SALLE
│           ├── RoomInfoSettings.tsx                   # Modifier nom/description de la salle
│           ├── RoomMembersSettings.tsx                # Gestion des membres
│           ├── RoomPermissionsSettings.tsx            # Gestion des autorisations
│           └── RoomPollsSettings.tsx                  # Configuration des sondages
│
├── pages/                                             # COUCHE 3 : Pages complètes accessibles via URL
│   ├── AboutPage.tsx                                  # Page "À propos"
│   ├── AccountConfirmedPage.tsx                       # Confirmation d’email
│   ├── ContactPage.tsx                                # Page de contact
│   ├── CreateRoomPage.tsx                             # Formulaire de création de salle
│   ├── EmailSentPage.tsx                              # Email envoyé (reset password…)
│   ├── JoinWithCodePage.tsx                           # Rejoindre une salle via un code
│   ├── LandingPage.tsx                                # Page d’accueil publique
│   ├── LoginPage.tsx                                  # Page de connexion
│   ├── RegisterPage.tsx                               # Page d’inscription
│   ├── MePage.tsx                                     # Page profil utilisateur (simple)
│   ├── ProfilePage.tsx                                # Page profil détaillé
│   ├── PublicRoomsPage.tsx                            # Salles publiques disponibles
│   ├── RoomInfoPage.tsx                               # Infos détaillées d’une salle
│   ├── RoomLoadingPage.tsx                            # Chargement avant entrée dans la salle
│   ├── RoomPage.tsx                                   # 🎯 Salle collaborative (chat + vidéo + playlist)
│   ├── RoomRulesPage.tsx                              # Règles internes de la salle
│   └── RoomSettingsPage.tsx                           # Page regroupant tous les réglages
│
├── routes/                                            # Routage global de l’application
│   └── AppRouter.tsx                                  # Déclaration de toutes les routes (React Router)
│
├── styles/                                            # Styles globaux Tailwind
│   └── globals.css                                    # Directives @tailwind + styles globaux
│
├── utils/                                             # Fonctions utilitaires (hors UI)
│   └── storage.ts                                     # Gestion du token & LocalStorage
│
├── main.jsx                                           # Point d’entrée React (montage de l’app)
├── index.html                                         # Template HTML principal
├── tailwind.config.js                                 # Configuration de Tailwind CSS
├── vite.config.js                                     # Configuration du bundler Vite
├── .env                                               # Variables d’environnement (URL API…)
├── .gitignore                                         # Éléments ignorés par Git
├── package.json                                       # Dépendances + scripts NPM
├── package-lock.json                                  # Version exacte des dépendances
└── README.md                                          # Documentation du projet

```

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
VITE_API_URL="http://localhost:8000/api"

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
