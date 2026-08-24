const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    short: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Short",
      default: null,
      index: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

likeSchema.index({ user: 1, short: 1 }, { unique: true, partialFilterExpression: { short: { $ne: null } } });
likeSchema.index({ user: 1, comment: 1 }, { unique: true, partialFilterExpression: { comment: { $ne: null } } });

const Like = mongoose.model("Like", likeSchema);
module.exports = Like;
