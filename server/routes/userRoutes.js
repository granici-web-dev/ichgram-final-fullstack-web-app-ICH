import express from "express";
import {
  getUserById,
  updateProfile,
  searchUsers,
} from "../controllers/userController.js";
import authenticateJWT from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// PUT /api/users/me - обновить свой профиль (аватар — через multer)
router.put("/me", authenticateJWT, upload.single("avatar"), updateProfile);

// GET /api/users/search?q=... - поиск пользователей (до /:id!)
router.get("/search", authenticateJWT, searchUsers);

// GET /api/users/:id - профиль пользователя по id
router.get("/:id", authenticateJWT, getUserById);

export default router;
