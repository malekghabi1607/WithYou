/**
 * Projet : WithYou – Plateforme de visionnage collaboratif
 * Fichier : vite.config.js
 *
 * Description :
 * Configuration principale du bundler Vite.
 * Responsable de :
 *    - Lancer le serveur de développement
 *    - Générer le build de production
 *    - Gérer les plugins (React, optimisation…)
 *
 * Ne contient généralement pas de logique métier, uniquement la configuration.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});