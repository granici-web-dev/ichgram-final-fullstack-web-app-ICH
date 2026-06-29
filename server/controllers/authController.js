import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

// Формируем безопасный объект пользователя (без пароля) для ответа
function publicUser(user) {
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    bio: user.bio,
    website: user.website,
    avatar: user.avatar,
  };
}

// POST /api/auth/register - регистрация пользователя
export const register = async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    // Проверка обязательных полей
    if (!fullName || !email || !username || !password) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    // Проверка, существует ли пользователь с таким email или username
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким email или username уже существует" });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      username,
      password: hashedPassword,
    });

    // Генерация токена
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ token, user: publicUser(newUser) });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/login - вход пользователя (по email или username)
export const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    // Поиск пользователя по email или username
    const user = await User.findOne({
      $or: [{ email: login.toLowerCase() }, { username: login }],
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: publicUser(user) });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/auth/me - текущий пользователь по токену
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
