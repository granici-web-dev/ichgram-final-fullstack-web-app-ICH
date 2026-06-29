import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Message from "../models/Message.js";

dotenv.config();

export function initSocket(io) {
  // Аутентификация сокета по JWT, который клиент передаёт при подключении
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized: No token provided"));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        return next(new Error("Unauthorized: Invalid token"));
      }
      socket.userId = data.userId;
      next();
    });
  });

  io.on("connection", (socket) => {
    // Каждый пользователь подключается к своей "комнате" по userId
    socket.join(socket.userId);
    console.log("Socket connected:", socket.id, "user:", socket.userId);

    // Отправка сообщения: сохраняем в БД и доставляем получателю
    socket.on("sendMessage", async ({ to, text }) => {
      try {
        if (!to || !text) return;

        const message = await Message.create({
          sender: socket.userId,
          recipient: to,
          text,
        });
        await message.populate("sender", "username fullName avatar");

        // Доставляем получателю и отправителю (синхронизация вкладок)
        io.to(to).emit("receiveMessage", message);
        io.to(socket.userId).emit("receiveMessage", message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}
