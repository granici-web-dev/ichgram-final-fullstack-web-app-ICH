import express from "express";
import {
  getNotifications,
  markAllRead,
} from "../controllers/notificationController.js";
import authenticateJWT from "../middlewares/auth.js";

const router = express.Router();

// GET /api/notifications - свои уведомления
router.get("/", authenticateJWT, getNotifications);

// PUT /api/notifications/read - отметить прочитанными
router.put("/read", authenticateJWT, markAllRead);

export default router;
