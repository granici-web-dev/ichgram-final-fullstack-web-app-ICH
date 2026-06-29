import Like from "../models/Like.js";

// POST /api/likes/:postId - поставить или снять лайк (toggle)
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const existing = await Like.findOne({ user: userId, post: postId });
    if (existing) {
      // Лайк уже есть — снимаем его
      await existing.deleteOne();
      const likesCount = await Like.countDocuments({ post: postId });
      return res.json({ liked: false, likesCount });
    }

    // Лайка нет — создаём
    await Like.create({ user: userId, post: postId });
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
