/*import { useEffect, useRef, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const API = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

export default function App() {
  const [status, setStatus] = useState('Initialisation...');
  const playerRef = useRef(null);

  // 1) Charger l’API YouTube IFrame
  useEffect(() => {
    setStatus('Chargement de l’API YouTube…');

    // Évite d’injecter le script deux fois
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    // YouTube appelle cette fonction globale quand l’API est prête
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('ytplayer', {
        videoId: 'N8JBP-quUUw',
        events: {
          onReady: () => setStatus('YouTube prêt, connexion WebSocket…'),
        },
      });
    };

    return () => {
      // Nettoyage (par sécurité)
      delete window.onYouTubeIframeAPIReady;
    };
  }, []);

  // 2) Config Echo + Reverb
  useEffect(() => {
    console.log('Reverb env :', {
      key: import.meta.env.VITE_REVERB_APP_KEY,
      host: import.meta.env.VITE_REVERB_HOST,
      port: import.meta.env.VITE_REVERB_PORT,
      scheme: import.meta.env.VITE_REVERB_SCHEME,
    });

    // On attend un tout petit peu pour laisser YouTube se charger
    const timeout = setTimeout(() => {
      try {
        window.Pusher = Pusher;

        const echo = new Echo({
          broadcaster: 'reverb', // 👈 très important
          key: import.meta.env.VITE_REVERB_APP_KEY,
          wsHost: import.meta.env.VITE_REVERB_HOST,
          wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
          wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
          forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
          enabledTransports: ['ws', 'wss'],
        });

        const channel = echo.channel('room.demo');

        channel
          .subscribed(() => {
            setStatus('Connecté au canal room.demo ✅');
          })
          .listen('.player.event', (e) => {
            const p = playerRef.current;
            if (!p) return;

            const payload = e.payload || {};
            console.log('Event reçu:', payload);

            if (payload.type === 'play') p.playVideo();
            if (payload.type === 'pause') p.pauseVideo();
            if (payload.type === 'seek') p.seekTo(payload.time ?? 0, true);
          });

        // nettoyage
        return () => {
          echo.disconnect();
        };
      } catch (err) {
        console.error(err);
        setStatus('Erreur lors de la connexion WebSocket ❌ (voir console)');
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  // 3) Appel API pour envoyer un événement
  const emit = async (payload) => {
    console.log('emit() appelé avec', payload, 'API =', API);

    try {
      const res = await fetch(`${API}/api/player/emit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      console.log('Réponse /api/player/emit :', res.status, data);
    } catch (e) {
      console.error('Erreur lors de l\'envoi au serveur ❌', e);
      setStatus("Erreur lors de l'envoi au serveur ❌");
    }
  };
  

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>With U — Proto temps réel (Reverb)</h1>
      <p>{status}</p>

      <div
        id="ytplayer"
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          background: '#000',
          marginTop: 20,
        }}
      />

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button
          onClick={() => {
            console.log('CLICK PLAY');
            emit({ type: 'play' });
          }}
        >
          Play
        </button>
        <button
          onClick={() => {
            console.log('CLICK PAUSE');
            emit({ type: 'pause' });
          }}
        >
          Pause
        </button>
        <button
          onClick={() => {
            console.log('CLICK SEEK');
            emit({ type: 'seek', time: 10 });
          }}
        >
          Seek 10s
        </button>
      </div>

      <p style={{ marginTop: 16 }}>
        Ouvre <b>deux onglets</b> sur <code>http://localhost:5173</code>, puis utilise les boutons dans
        un onglet pour voir l’autre réagir.
      </p>
    </div>
  );
}*/

import { Link, Route, Routes, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import MePage from "./pages/MePage";

function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 px-6 py-3 flex justify-between items-center">
        <div className="font-bold text-xl">WithU (MVP)</div>
        <nav className="flex gap-4 text-sm">
          <Link to="/register" className="hover:underline">
            Register
          </Link>
          <Link to="/login" className="hover:underline">
            Login
          </Link>
          <Link to="/me" className="hover:underline">
            Me
          </Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/register" />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/me" element={<MePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;