import express from "express";
import {
  createPost,
  getAllPosts,
  getUserPosts,
  getExplore,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import authenticateJWT from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// POST /api/posts - создать пост
router.post("/", authenticateJWT, upload.single("image"), createPost);

// GET /api/posts - лента (все посты)
router.get("/", authenticateJWT, getAllPosts);

// GET /api/posts/user/:userId - посты пользователя
router.get("/user/:userId", authenticateJWT, getUserPosts);

// GET /api/posts/explore - случайные посты (до /:id!)
router.get("/explore", authenticateJWT, getExplore);

// GET /api/posts/:id - пост по id
router.get("/:id", authenticateJWT, getPostById);

// PUT /api/posts/:id - обновить пост (только автор)
router.put("/:id", authenticateJWT, upload.single("image"), updatePost);

// DELETE /api/posts/:id - удалить пост (только автор)
router.delete("/:id", authenticateJWT, deletePost);

export default router;
