import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";

// GET /api/messages/:userId - история переписки с конкретным пользователем
export const getConversation = async (req, res) => {
  try {
    const me = req.user.userId;
    const other = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: me, recipient: other },
        { sender: other, recipient: me },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username fullName avatar");

    res.json(messages);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/messages - список диалогов (последнее сообщение с каждым собеседником)
export const getConversations = async (req, res) => {
  try {
    const me = new mongoose.Types.ObjectId(req.user.userId);

    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: me }, { recipient: me }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          // Группируем по собеседнику (не по себе)
          _id: { $cond: [{ $eq: ["$sender", me] }, "$recipient", "$sender"] },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    // Подгружаем данные собеседника
    const populated = await User.populate(conversations, {
      path: "_id",
      select: "username fullName avatar",
    });

    res.json(
      populated.map((c) => ({ user: c._id, lastMessage: c.lastMessage })),
    );
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
