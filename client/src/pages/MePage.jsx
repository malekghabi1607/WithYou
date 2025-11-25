import { useState } from "react";
import { api } from "../api";

export default function MePage() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);

  const loadMe = async () => {
    setError(null);
    try {
      const res = await api.get("/auth/me");
      setMe(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || { message: "Erreur inconnue" });
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // on s'en fiche un peu pour le MVP
    }
    localStorage.removeItem("token");
    setMe(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Mon profil ( /auth/me )</h1>

        <div className="flex gap-2 mb-4">
          <button
            onClick={loadMe}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 py-2 rounded font-semibold"
          >
            Charger /auth/me
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-red-500 hover:bg-red-600 py-2 rounded font-semibold"
          >
            Logout
          </button>
        </div>

        {me && (
          <pre className="text-sm text-emerald-300 whitespace-pre-wrap">
            {JSON.stringify(me, null, 2)}
          </pre>
        )}

        {error && (
          <pre className="mt-4 text-sm text-red-300 whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </pre>
        )}

        {!me && !error && (
          <p className="text-sm text-slate-300">
            Clique sur &quot;Charger /auth/me&quot; après un login ou register
            pour vérifier que le token fonctionne.
          </p>
        )}
      </div>
    </div>
  );
}