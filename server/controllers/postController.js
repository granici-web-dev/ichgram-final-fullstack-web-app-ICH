import Post from "../models/Post.js";
import Like from "../models/Like.js";
import Comment from "../models/Comment.js";

// Извлекаем изображение из запроса: файл через multer (→ Base64) или готовая Base64-строка
function getImageFromRequest(req) {
  if (req.file) {
    return `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  }
  return req.body.image;
}

// Добавляем к постам количество лайков/комментариев и флаг isLiked для текущего пользователя.
// Делаем это батчем (3 запроса на всю ленту), а не по запросу на каждый пост.
async function enrichPosts(posts, userId) {
  const postIds = posts.map((post) => post._id);
  const likes = await Like.find({ post: { $in: postIds } });
  const comments = await Comment.find({ post: { $in: postIds } });

  return posts.map((post) => {
    const postId = post._id.toString();
    const postLikes = likes.filter((like) => like.post.toString() === postId);
    return {
      ...post,
      likesCount: postLikes.length,
      commentsCount: comments.filter((c) => c.post.toString() === postId).length,
      isLiked: postLikes.some((like) => like.user.toString() === userId),
    };
  });
}

// POST /api/posts - создать пост
export const createPost = async (req, res) => {
  try {
    const { description } = req.body;
    const image = getImageFromRequest(req);

    if (!image) {
      return res.status(400).json({ message: "Изображение обязательно" });
    }

    const post = await Post.create({
      image,
      description: description || "",
      author: req.user.userId,
    });

    await post.populate("author", "username fullName avatar");
    // Новый пост — счётчики нулевые
    res.status(201).json({
      ...post.toObject(),
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/posts - все посты (лента), новые сверху
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "username fullName avatar")
      .lean();
    const enriched = await enrichPosts(posts, req.user.userId);
    res.json(enriched);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/posts/user/:userId - все посты конкретного пользователя
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("author", "username fullName avatar")
      .lean();
    const enriched = await enrichPosts(posts, req.user.userId);
    res.json(enriched);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/posts/explore - случайные посты для раздела Explore
export const getExplore = async (req, res) => {
  try {
    // $sample возвращает случайные документы
    const sample = await Post.aggregate([{ $sample: { size: 30 } }]);
    const posts = await Post.populate(sample, {
      path: "author",
      select: "username fullName avatar",
    });
    const enriched = await enrichPosts(posts, req.user.userId);
    res.json(enriched);
  } catch (error) {
    console.error("Error fetching explore posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/posts/:id - один пост по id
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username fullName avatar")
      .lean();
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const [enriched] = await enrichPosts([post], req.user.userId);
    res.json(enriched);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/posts/:id - обновить пост (только автор)
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Проверка авторства
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Нет доступа к этому посту" });
    }

    const { description } = req.body;
    if (description !== undefined) post.description = description;

    const image = getImageFromRequest(req);
    if (image) post.image = image;

    await post.save();
    await post.populate("author", "username fullName avatar");
    const [enriched] = await enrichPosts([post.toObject()], req.user.userId);
    res.json(enriched);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/posts/:id - удалить пост (только автор)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Нет доступа к этому посту" });
    }

    await post.deleteOne();
    // Заодно чистим лайки и комментарии удалённого поста
    await Like.deleteMany({ post: post._id });
    await Comment.deleteMany({ post: post._id });
    res.json({ message: "Пост удалён" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
