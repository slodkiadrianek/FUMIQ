import { app } from "./app.js";
import { Db } from "./config/database.config.js";
import { caching } from "./app.js";
import { RedisCacheService } from "./types/common.type.js";
import { createServer } from "http";
import { Server } from "socket.io";

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN_LINK || "http://127.0.0.1:5500",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("message", (data) => {
    console.log(`Message received: ${data}`);
    io.emit("message", data); // Broadcast message
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(3000, async () => {
  new Db(process.env.DB_LINK || "");
  await (caching as RedisCacheService).set("key", "value");
  const value = await (caching as RedisCacheService).get("key");
  if (value) {
    console.log(`Caching service is working`);
  }
  console.log(`Server is running on port 3000`);
});
