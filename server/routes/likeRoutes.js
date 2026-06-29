import express from "express";
import { toggleLike, getLikes } from "../controllers/likeController.js";
import authenticateJWT from "../middlewares/auth.js";

const router = express.Router();

// POST /api/likes/:postId - поставить/снять лайк
router.post("/:postId", authenticateJWT, toggleLike);

// GET /api/likes/:postId - лайки поста
router.get("/:postId", authenticateJWT, getLikes);

export default router;
