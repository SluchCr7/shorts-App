const mongoose = require("mongoose");

const soundSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Sound title is required"],
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
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    duration: {
      type: Number,
      default: 0,
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

const Sound = mongoose.model("Sound", soundSchema);
module.exports = Sound;
