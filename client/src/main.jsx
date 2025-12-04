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
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./routes/AppRouter.tsx";
import "./styles/globals.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
