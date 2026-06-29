import Follow from "../models/Follow.js";
import {
  createNotification,
  deleteNotification,
} from "./notificationController.js";

// POST /api/follow/:userId - подписаться на пользователя
export const followUser = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const followingId = req.params.userId;

    // Нельзя подписаться на самого себя
    if (followerId === followingId) {
      return res
        .status(400)
        .json({ message: "Нельзя подписаться на самого себя" });
    }

    // Проверка, нет ли уже такой подписки
    const existing = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });
    if (existing) {
      return res.status(400).json({ message: "Вы уже подписаны" });
    }

    await Follow.create({ follower: followerId, following: followingId });
    await createNotification({
      recipient: followingId,
      sender: followerId,
      type: "follow",
    });
    res.status(201).json({ message: "Подписка оформлена" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/follow/:userId - отписаться от пользователя
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const followingId = req.params.userId;

    const existing = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });
    if (!existing) {
      return res
        .status(400)
        .json({ message: "Вы не подписаны на этого пользователя" });
    }

    await existing.deleteOne();
    await deleteNotification({
      recipient: followingId,
      sender: followerId,
      type: "follow",
    });
    res.json({ message: "Вы отписались" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/follow/:userId/followers - подписчики пользователя
export const getFollowers = async (req, res) => {
  try {
    const follows = await Follow.find({ following: req.params.userId }).populate(
      "follower",
      "username fullName avatar",
    );
    const followers = follows.map((f) => f.follower);
    res.json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/follow/:userId/following - подписки пользователя
export const getFollowing = async (req, res) => {
  try {
    const follows = await Follow.find({ follower: req.params.userId }).populate(
      "following",
      "username fullName avatar",
    );
    const following = follows.map((f) => f.following);
    res.json(following);
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
