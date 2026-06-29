import Notification from "../models/Notification.js";

// Создать уведомление (вызывается из контроллеров лайков, комментариев, подписок).
// Себя не уведомляем.
export const createNotification = async ({ recipient, sender, type, post }) => {
  if (recipient.toString() === sender.toString()) return;
  await Notification.create({ recipient, sender, type, post });
};

// Удалить уведомление (при снятии лайка / отписке)
export const deleteNotification = async ({ recipient, sender, type, post }) => {
  const filter = { recipient, sender, type };
  if (post) filter.post = post;
  await Notification.deleteOne(filter);
};

// GET /api/notifications - уведомления текущего пользователя
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.userId })
      .sort({ createdAt: -1 })
      .populate("sender", "username fullName avatar")
      .populate("post", "image");
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/notifications/read - отметить все уведомления прочитанными
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, read: false },
      { read: true },
    );
    res.json({ message: "Уведомления прочитаны" });
  } catch (error) {
    console.error("Error marking notifications read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
