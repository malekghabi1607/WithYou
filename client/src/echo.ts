// client/src/echo.ts

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;

  }
}

window.Pusher = Pusher;

export const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'gzmkzi7dff9dgxfjifke',
    wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
    wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
});

echo.connector.pusher.connection.bind('connected', () => {
    console.log('✅ Echo connecté à Reverb');
});

echo.connector.pusher.connection.bind('error', (err: any) => {
    console.error('❌ Erreur Echo:', err);
});
