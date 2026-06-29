import express from "express";
import {
  addComment,
  getComments,
  deleteComment,
} from "../controllers/commentController.js";
import authenticateJWT from "../middlewares/auth.js";

const router = express.Router();

// POST /api/comments/:postId - добавить комментарий
router.post("/:postId", authenticateJWT, addComment);

// GET /api/comments/:postId - комментарии поста
router.get("/:postId", authenticateJWT, getComments);

// DELETE /api/comments/:id - удалить свой комментарий
router.delete("/:id", authenticateJWT, deleteComment);

export default router;
