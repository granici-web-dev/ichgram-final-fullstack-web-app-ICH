import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import authenticateJWT from "../middlewares/auth.js";

const router = express.Router();

// POST /api/auth/register - регистрация
router.post("/register", register);

// POST /api/auth/login - вход
router.post("/login", login);

// GET /api/auth/me - текущий пользователь
router.get("/me", authenticateJWT, getMe);

export default router;
