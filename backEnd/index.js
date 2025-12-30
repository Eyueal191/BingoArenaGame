import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import app from "./src/app.js";
import { config } from "dotenv";
import gameSocket from "./src/sockets/gameSocket.js";
import cardSocket from "./src/sockets/cardSocket.js";
import connectDB from "./src/config/db.js";
import chatSocket from "./src/sockets/chatSocket.js";

config();
connectDB();
// 1️⃣ Create HTTP server.

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// 3️⃣ Handle socket connections.

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Delegate all socket events to gameSocket module.

  gameSocket(io, socket);
  cardSocket(io, socket);
  chatSocket(io, socket);
  // Handle client disconnect.

  socket.on("disconnect", () => {
    console.log(`Client with socketId ${socket.id} has disconnected!`);
  });
});

// 4️⃣ Handle Socket.IO server errors.

io.on("error", (err) => {
  console.error(`Socket.IO server error: ${err.message}`);
});
// 5️⃣ Start HTTP server.

const port = process.env.PORT || 5000;
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
