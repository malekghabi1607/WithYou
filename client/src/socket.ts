// client/src/socket.ts

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_REVERB_HOST 
  ? `${import.meta.env.VITE_REVERB_SCHEME}://${import.meta.env.VITE_REVERB_HOST}:${import.meta.env.VITE_REVERB_PORT}`
  : "http://127.0.0.1:8080";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

socket.on("connect", () => {
  console.log("✅ Socket connecté à Reverb:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Socket déconnecté");
});

socket.on("connect_error", (error) => {
  console.error("❌ Erreur de connexion socket:", error);
});
