import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { roomHandler } from "./room";

/**
 * To create express app.
 */
const app = express();
app.use(cors); // Ensure CORS middleware is applied correctly

/**
 * To create HTTP server
 */
const port = process.env.PORT ?? 8080;
const server = http.createServer(app);

/**
 * To create web socket server
 */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

/**
 * To subscribe to the event.
 * When a client connects to our web signaling server, the connection event will fire
 */
io.on("connection", (socket) => {
  console.log("a user connected");
  roomHandler(socket);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Listening to the server on port ${port}`);
});
