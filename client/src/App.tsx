/**
 * Projet : WithYou
 * Fichier : App.tsx
 *
 * Description :
 * Composant racine de l’application front-end.
 *
 * Ce composant est responsable de :
 *  - l’initialisation du routage global avec React Router
 *  - l’encapsulation de toute l’application dans BrowserRouter
 *  - le chargement du système de navigation via AppRouter
 *
 * Il constitue le point d’entrée logique de l’interface utilisateur
 * et permet la navigation entre toutes les pages de l’application
 * (authentification, salons, création, visionnage, paramètres, etc.).
 *
 * Toute la logique de routage détaillée est déléguée à AppRouter.
 */

import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;