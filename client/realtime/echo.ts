import Echo from "laravel-echo";
import Pusher from "pusher-js";

(window as any).Pusher = Pusher;

const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");

const REVERB_KEY = import.meta.env.VITE_REVERB_APP_KEY ?? "local";
const REVERB_HOST = import.meta.env.VITE_REVERB_HOST ?? "127.0.0.1";
const REVERB_PORT = Number(import.meta.env.VITE_REVERB_PORT ?? 8080);
const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME ?? "http";

function getToken(): string {
  return localStorage.getItem("token") ?? "";
}

export function makeEcho() {
  return new Echo({
    broadcaster: "pusher",
    key: REVERB_KEY,
    cluster: "mt1",

    wsHost: REVERB_HOST,
    wsPort: Number.isFinite(REVERB_PORT) ? REVERB_PORT : 8080,
    wssPort: Number.isFinite(REVERB_PORT) ? REVERB_PORT : 8080,
    forceTLS: REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],

   
    authorizer: (channel) => {
      return {
        authorize: async (socketId: string, callback: Function) => {
          try {
            const token = getToken();

            const res = await fetch(`${API_URL}/broadcasting/auth`, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                socket_id: socketId,
                channel_name: channel.name,
              }),
            });

            const data = await res.json();

            if (!res.ok) {
              callback(true, data);
              return;
            }

            callback(false, data);
          } catch (err) {
            callback(true, err);
          }
        },
      };
    },
  });
}

export const echo = makeEcho();