# WITHYOU 🎬🫂

Plateforme collaborative de visionnage synchronisé permettant à plusieurs utilisateurs de regarder des vidéos ensemble et d’interagir en temps réel.

## 🚀 Présentation du projet

WithYou est une application web permettant de :

- Regarder la même vidéo de façon synchronisée
- Créer ou rejoindre des salons virtuels
- Discuter avec les autres membres via un chat temps réel
- Gérer des playlists, permissions et sondages selon le rôle utilisateur

Ce projet est développé dans le cadre du module Ingénierie Logicielle (IL – Semestre 5).

## 🧩 Fonctionnalités (MVP)

- 🔐 Inscription et authentification
- 📺 Création et gestion de salons
- 🎦 Lecture vidéo synchronisée (YouTube IFrame API)
- 💬 Chat en temps réel
- 👥 Gestion des membres et permissions
- 📄 Sondages et interactions simples
- 🧭 Liste des salons publics

## 🛠️ Technologies utilisées

### Front-end

- React 19
- React Router
- Vite
- Tailwind CSS
- Radix UI (composants UI)
- Lucide React (icônes)
- Axios
- Sonner (notifications)
- Supabase JS
- Typescript

### Back-end

- PHP 8.2+
- Laravel 12 (API REST)
- JWT (`php-open-source-saver/jwt-auth`)
- Laravel Reverb
- Laravel Echo + Pusher JS

### Realtime

- Socket.io (serveur Node.js + client)
- Laravel Reverb (canaux temps réel Laravel)

### Données

- Supabase (auth, données, realtime)
- Base relationnelle côté backend (PostgreSQL/MySQL selon environnement)

### Outils

- Node.js / npm
- Composer
- ESLint / PostCSS / Autoprefixer
- PHPUnit / Mockery
- GitHub / GitHub Actions
- Netlify / Render / Railway (déploiement)
- Jira / Notion / Figma

## 🏗️ Architecture du projet

```bash
client/      # Frontend React/Vite
server/      # API Laravel
realtime/    # Service Socket.io
doc/         # Documentation projet
```

## 🔧 Installation & exécution

### 📌 1. Cloner le projet

```bash
git clone https://github.com/malekghabi1607/WithYou.git
cd WithYou
```

### 📌 2. Installer et lancer le front-end

```bash
cd client
npm ci
npm run dev
```

### 📌 3. Installer et lancer le back-end

```bash
cd server
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --force
php artisan serve
```

### 📌 4. Lancer le service realtime (optionnel)

```bash
cd realtime
npm ci
npm start
```

## 🌍 Déploiement

Les fichiers de configuration sont déjà présents dans le dépôt :

- `DEPLOY.md`
- `netlify.toml`
- `render.yaml`

## 🖼️ Maquettes & visuels

Les maquettes UI du projet sont disponibles dans :

- `doc/ressources/maquettee/`

Logo :

- `doc/ressources/logos/logo.png`

Écrans principaux (issus du dossier maquettes) :

| Écran | Aperçu |

|---|---|

| Landing page | ![Landing Page](doc/ressources/maquettee/LandingPage.jpg) |
| Connexion | ![Login Page](doc/ressources/maquettee/LoginPage.jpg) |
| Inscription | ![Register Page](doc/ressources/maquettee/RegisterPage.jpg) |
| Salons publics | ![Public Rooms Page](doc/ressources/maquettee/PublicRoomsPage.jpg) |
| Créer/Rejoindre un salon | ![Join Or Create Room](doc/ressources/maquettee/JoinOrCreateRoomPage.jpg) |
| Création d’un salon | ![Create Room Page](doc/ressources/maquettee/CreateRoomPage.jpg) |
| Infos salon | ![Room Info Page](doc/ressources/maquettee/RoomInfoPage.jpg) |
| Règles du salon | ![Room Rules Page](doc/ressources/maquettee/RoomRulesPage.jpg) |
| Participants (admin) | ![Room Admin Participants](doc/ressources/maquettee/RoomAdminParticipantsPage.jpg) |
| Chat (admin) | ![Room Admin Chat](doc/ressources/maquettee/RoomAdminChatPage.jpg) |
| Playlist vidéos | ![Room Playlist](doc/ressources/maquettee/RoomVideosPlaylistPage.jpg) |
| Paramètres salon | ![Room Settings](doc/ressources/maquettee/RoomSettingsPage.jpg) |
| Mot de passe oublié | ![Forgot Password](doc/ressources/maquettee/ForgotPasswordPage.jpg) |
| Email envoyé | ![Email Sent](doc/ressources/maquettee/EmailSentPage.jpg) |
| Confirmation de compte | ![Account Confirmed](doc/ressources/maquettee/AccountConfirmedPage.jpg) |

## 👥 Équipe

- **Malek Ghabi** — Coordination & Front-end (React, maquettes, UI)
- **Meriem Takdjerad** — Logique front + intégration API
- **Wissam Taleb** — Back-end Laravel & Base de données
- **Lamia Taleb** — Contribution projet
- **Yanis Laftimi** — Back-end & logique métier

## 📌 Statut du projet

- MVP en cours de développement
- Architecture complète validée
- Base de données fonctionnelle
