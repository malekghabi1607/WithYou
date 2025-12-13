/**
 * Projet : WithYou – Plateforme de visionnage collaboratif
 * Fichier : main.tsx
 *
 * Description :
 * Point d’entrée principal de l’application front-end React.
 *
 * Ce fichier est responsable de :
 *  - l’initialisation de l’application
 *  - le montage du composant racine App dans le DOM
 *  - le chargement des styles globaux (Tailwind / CSS)
 *  - l’activation du mode StrictMode pour le développement
 *
 * Il est exécuté en premier par Vite lors du démarrage
 * de l’application et constitue le point d’amorçage du front.
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