const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    short: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Short",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
