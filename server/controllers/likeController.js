import Like from "../models/Like.js";
import Post from "../models/Post.js";
import {
  createNotification,
  deleteNotification,
} from "./notificationController.js";

// POST /api/likes/:postId - поставить или снять лайк (toggle)
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existing = await Like.findOne({ user: userId, post: postId });
    if (existing) {
      // Лайк уже есть — снимаем его и убираем уведомление
      await existing.deleteOne();
      await deleteNotification({
        recipient: post.author,
        sender: userId,
        type: "like",
        post: postId,
      });
      const likesCount = await Like.countDocuments({ post: postId });
      return res.json({ liked: false, likesCount });
    }

    // Лайка нет — создаём и уведомляем автора поста
    await Like.create({ user: userId, post: postId });
    await createNotification({
      recipient: post.author,
      sender: userId,
      type: "like",
      post: postId,
    });
    const likesCount = await Like.countDocuments({ post: postId });
    res.json({ liked: true, likesCount });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/likes/:postId - все лайки поста (количество + кто лайкнул)
export const getLikes = async (req, res) => {
  try {
    const likes = await Like.find({ post: req.params.postId }).populate(
      "user",
      "username fullName avatar",
    );
    res.json({ likesCount: likes.length, likes });
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
