import mongoose from "mongoose";

const followSchema = new mongoose.Schema({
  // Кто подписывается
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // На кого подписываются
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Нельзя подписаться на одного пользователя дважды
followSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = mongoose.model("Follow", followSchema);

export default Follow;
