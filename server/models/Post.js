import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Post = mongoose.model("Post", postSchema);

export default Post;
