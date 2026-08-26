const mongoose = require("mongoose");

const shortSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },
    videoPublicId: {
      type: String,
      required: true,
    },
    originalShort: {
      type: mongoose.Schema.Types.ObjectId,
      ref : "Short",
      default : null,
    },
    thumbnailUrl: {
      type: String,
      required: [true, "Thumbnail URL is required"],
    },
    thumbnailPublicId: {
      type: String,
      default: "",
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
      index: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    savesCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
    sound: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sound",
      default: null,
    },
    audioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sound",
      default: null,
    },
    isOriginalAudio: {
      type: Boolean,
      default: false,
    },
    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
      },
    ],
    privacy: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

shortSchema.index({ createdAt: -1 });
shortSchema.index({ title: "text", description: "text", hashtags: "text" });

const Short = mongoose.model("Short", shortSchema);
module.exports = Short;
