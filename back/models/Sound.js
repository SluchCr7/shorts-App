const mongoose = require("mongoose");

const soundSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Sound title is required"],
      trim: true,
    },
    artist: {
      type: String,
      default: "Original Sound",
      trim: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    audioPublicId: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    duration: {
      type: Number,
      default: 0,
    },
    usesCount: {
      type: Number,
      default: 0,
      index: true,
    },
    shortsCount: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

soundSchema.index({ title: "text", artist: "text" });

const Sound = mongoose.model("Sound", soundSchema);
module.exports = Sound;
