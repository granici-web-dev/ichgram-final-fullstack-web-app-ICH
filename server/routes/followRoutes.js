import express from "express";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controllers/followController.js";
import authenticateJWT from "../middlewares/auth.js";

const router = express.Router();

// POST /api/follow/:userId - подписаться
router.post("/:userId", authenticateJWT, followUser);

// DELETE /api/follow/:userId - отписаться
router.delete("/:userId", authenticateJWT, unfollowUser);

// GET /api/follow/:userId/followers - подписчики
router.get("/:userId/followers", authenticateJWT, getFollowers);

// GET /api/follow/:userId/following - подписки
router.get("/:userId/following", authenticateJWT, getFollowing);

export default router;
