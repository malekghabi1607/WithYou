/**
 * Projet : WithYou – Plateforme de visionnage collaboratif
 * Fichier : main.jsx
 *
 * Description :
 * Point d’entrée principal de l'application React.
 * Son rôle :
 *    - Monter le composant AppRouter dans le DOM
 *    - Charger les styles globaux
 *    - Initialiser l’application
 *
 * Fichier essentiel exécuté en premier par Vite.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";   // PAS ./routes/AppRouter.tsx
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);