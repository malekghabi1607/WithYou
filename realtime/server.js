const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
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

    socket.on("disconnect", () => {
        console.log("❌ Client déconnecté");
    });
});

server.listen(3000, () => {
    console.log("🔥 Socket.io écoute sur http://localhost:3000");
});

// ======================
// VOTES TEMPS RÉEL
// ======================
io.on("connection", (socket) => {

    socket.on("join_salon", (salonId) => {
        socket.join(salonId);
        console.log("👤 Client rejoint le salon :", salonId);
    });

    // Vote pour une vidéo
    socket.on("video_vote", (data) => {
        console.log("🗳️ Vote reçu :", data);

        // Diffuser à tous les utilisateurs du salon
        io.to(data.salonId).emit("video_vote_update", {
            videoId: data.videoId
        });
    });

});
