import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Socket.io (real-time messaging — used by the chat feature)
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: "25mb" })); // лимит увеличен под изображения в Base64
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.get("/", (req, res) => {
  res.json({ message: "ICHgram API is running" });
});

// Routes
app.use("/api/auth", authRoutes);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running at http://127.0.0.1:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect db and start server!", err);
  });
