/**
 * Projet : WithYou – Plateforme de visionnage collaboratif
 * Fichier : routes/AppRouter.tsx
 *
 * Description :
 * Fichier central du routage de l'application.
 * Déclare toutes les routes accessibles via React Router :
 *    - Pages publiques (Landing, Login, Register…)
 *    - Pages authentifiées (Room, Profil, Settings…)
 *
 * Rôle :
 *    - Associer chaque URL à une page (Vue complète)
 *    - Gérer les redirections
 *    - Protéger certaines routes si nécessaire
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import TestUser from "../pages/test-user(yanis)";
import TestSalon from "../pages/test-salon(yanis)";
import TestPageSalon from "../pages/test-page-salon(yanis)";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tu" element={<TestUser />} />
        <Route path="/ts" element={<TestSalon />} />
        <Route path="/tps" element={<TestPageSalon />} />
      </Routes>
    </BrowserRouter>
  );
}