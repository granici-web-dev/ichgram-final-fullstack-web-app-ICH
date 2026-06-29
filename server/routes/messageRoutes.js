import express from "express";
import {
  getConversation,
  getConversations,
} from "../controllers/messageController.js";
import authenticateJWT from "../middlewares/auth.js";

const router = express.Router();

// GET /api/messages - список диалогов
router.get("/", authenticateJWT, getConversations);

// GET /api/messages/:userId - переписка с пользователем
router.get("/:userId", authenticateJWT, getConversation);

export default router;
