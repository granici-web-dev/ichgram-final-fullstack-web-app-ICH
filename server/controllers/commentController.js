import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { createNotification } from "./notificationController.js";

// POST /api/comments/:postId - добавить комментарий к посту
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Текст комментария обязателен" });
    }

    const comment = await Comment.create({
      text,
      author: req.user.userId,
      post: req.params.postId,
    });

    // Уведомляем автора поста о новом комментарии
    const post = await Post.findById(req.params.postId);
    if (post) {
      await createNotification({
        recipient: post.author,
        sender: req.user.userId,
        type: "comment",
        post: req.params.postId,
      });
    }

    await comment.populate("author", "username fullName avatar");
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/comments/:postId - все комментарии поста (старые сверху)
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate("author", "username fullName avatar");
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/comments/:id/like - поставить/снять лайк комментарию (toggle)
export const toggleCommentLike = async (req, res) => {
  try {
    const userId = req.user.userId;
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const index = comment.likes.findIndex((id) => id.toString() === userId);
    if (index === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(index, 1);
    }
    await comment.save();

    res.json({ liked: index === -1, likesCount: comment.likes.length });
  } catch (error) {
    console.error("Error toggling comment like:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/comments/:id - удалить свой комментарий
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Удалять можно только свой комментарий
    if (comment.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Нет доступа к этому комментарию" });
    }

    await comment.deleteOne();
    res.json({ message: "Комментарий удалён" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
