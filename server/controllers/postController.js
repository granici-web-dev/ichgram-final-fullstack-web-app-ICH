import Post from "../models/Post.js";

// Извлекаем изображение из запроса: файл через multer (→ Base64) или готовая Base64-строка
function getImageFromRequest(req) {
  if (req.file) {
    return `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  }
  return req.body.image;
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
    res.status(201).json(post);
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
      .populate("author", "username fullName avatar");
    res.json(posts);
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
      .populate("author", "username fullName avatar");
    res.json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/posts/:id - один пост по id
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "username fullName avatar",
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
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
    res.json(post);
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
    res.json({ message: "Пост удалён" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
