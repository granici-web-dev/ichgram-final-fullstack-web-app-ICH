import User from "../models/User.js";
import Post from "../models/Post.js";
import Follow from "../models/Follow.js";

// GET /api/users/search?q=... - поиск пользователей по username или имени
export const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.json([]);
    }

    // Экранируем спецсимволы, чтобы кривой ввод не сломал регулярку
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");

    const users = await User.find({
      $or: [{ username: regex }, { fullName: regex }],
      _id: { $ne: req.user.userId },
    })
      .select("username fullName avatar")
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/users/:id - получить профиль пользователя по id (со счётчиками)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Счётчики профиля + подписан ли на него текущий пользователь
    const [postsCount, followersCount, followingCount, isFollowing] =
      await Promise.all([
        Post.countDocuments({ author: user._id }),
        Follow.countDocuments({ following: user._id }),
        Follow.countDocuments({ follower: user._id }),
        Follow.exists({ follower: req.user.userId, following: user._id }),
      ]);

    res.json({
      ...user,
      postsCount,
      followersCount,
      followingCount,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/users/me - обновление своего профиля (имя, username, био, сайт, аватар)
export const updateProfile = async (req, res) => {
  try {
    const { fullName, username, bio, website } = req.body;
    const updates = {};

    // Обновляем только те поля, которые пришли в запросе
    if (fullName !== undefined) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio;
    if (website !== undefined) updates.website = website;

    // Смена username — с проверкой, что он не занят другим пользователем
    if (username) {
      const existing = await User.findOne({ username });
      if (existing && existing._id.toString() !== req.user.userId) {
        return res.status(400).json({ message: "Username уже занят" });
      }
      updates.username = username;
    }

    // Аватар: файл через multer (конвертируем в Base64) либо готовая Base64-строка в теле
    if (req.file) {
      updates.avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    } else if (req.body.avatar !== undefined) {
      updates.avatar = req.body.avatar;
    }

    const user = await User.findByIdAndUpdate(req.user.userId, updates, {
      returnDocument: "after",
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
