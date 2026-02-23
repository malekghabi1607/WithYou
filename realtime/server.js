const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const port = Number(process.env.PORT || 3000);
const corsOrigin = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: corsOrigin }));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: corsOrigin,
        methods: ["GET", "POST"]
    }
});

console.log("🚀 Serveur Socket.io démarré");

io.on("connection", (socket) => {

    socket.on("join_salon", (salonId) => {
        socket.join(salonId);
        console.log("👤 Un client a rejoint :", salonId);
    });

    socket.on("video_action", (data) => {
        console.log("🎬 Action vidéo reçue :", data);

        io.to(data.salon).emit("video_update", {
            action: data.action,
            videoId: data.videoId,
            time: data.time
        });
    });

    socket.on("video_vote", (data) => {
        console.log("🗳️ Vote reçu :", data);

        io.to(data.salonId).emit("video_vote_update", {
            videoId: data.videoId
        });
    });

    socket.on("disconnect", () => {
        console.log("❌ Client déconnecté");
    });
});

server.listen(port, () => {
    console.log(`🔥 Socket.io écoute sur le port ${port}`);
});
