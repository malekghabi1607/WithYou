# WITHYOU 🎬🫂

Plateforme collaborative de visionnage synchronisé permettant à plusieurs utilisateurs de regarder des vidéos ensemble et d’interagir en temps réel.

## 🚀 Présentation du projet

WithYou est une application web permettant de :

- Regarder la même vidéo de façon parfaitement synchronisée ;
- Créer ou rejoindre des salons virtuels ;
- Discuter avec les autres membres via un chat temps réel ;
- Gérer des playlists, permissions et sondages selon le rôle utilisateur.

Ce projet est développé dans le cadre du module Ingénierie Logicielle (IL – Semestre 5).

## 🧩 Fonctionnalités (MVP)

- 🔐 Inscription & authentification (JWT)
- 📺 Création et gestion de salons
- 🎦 Lecture vidéo synchronisée (YouTube IFrame API)
- 💬 Chat en temps réel
- 👥 Gestion des membres et permissions
- 📄 Sondages et interactions simples
- 🧭 Liste des salons publics

## 🛠️ Technologies utilisées

### Front-end

- React.js  
- Vite  
- Tailwind CSS  

### Back-end

- Laravel (PHP)
- API RESTful
- Authentification JWT

### Base de données

- MySQL

### Autres outils

- Socket.io (temps réel)
- YouTube IFrame API
- GitHub, Jira, Notion, Figma

## 🏗️ Architecture du projet

``` bash

client/
 └── src/ (React components, pages)
 └── index.html
 └── vite.config.js

server/
 └── app/ (Controllers, Models)
 └── routes/api.php
 └── config/
 └── database/
 └── artisan

database/
 └── tablebase.sql

```

## 🔧 Installation & exécution

### 📌 1. Cloner le projet

``` bash

git clone https://github.com/votre-repo/withyou.git
```

### 📌 2. Installer le front-end

``` bqash

cd client
npm install
npm run dev
```

### 📌 3. Installer le back-end

```

cd server
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

## 👥 Équipe

- **Malek Ghabi** — Coordination & Front-end (React, maquettes, UI)
- **Meriem Takdjerad** — Logique front + intégration API
- **Wissam Taleb** — Back-end Laravel & Base de données
- **Yanis Laftimi** — Back-end & logique métier

## 📌 Statut du projet

✔ MVP en cours de développement  
✔ Architecture complète validée  
✔ Base de données fonctionnelle  

## 📚 Cahier des charges

Le cahier des charges complet est disponible dans le répertoire du projet.

## 📈 Perspectives

- Système de rôles avancés
- Historique et recommandations
- Tests unitaires / intégration
- CI/CD GitHub Actions
- Hébergement Render / Railway
