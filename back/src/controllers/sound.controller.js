const Sound = require("../models/Sound");
const Short = require("../models/Short");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get sound details by ID
// @route   GET /api/v1/sounds/:id
// @access  Public
const getSoundDetails = asyncHandler(async (req, res) => {
  const sound = await Sound.findById(req.params.id).populate(
    "creator",
    "username fullName avatar"
  );

  if (!sound) {
    throw new ApiError(404, "Sound track not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, sound, "Sound track fetched successfully"));
});

// @desc    Get trending / popular sounds
// @route   GET /api/v1/sounds/trending
// @access  Public
const getTrendingSounds = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  const sounds = await Sound.find()
    .populate("creator", "username fullName avatar")
    .sort({ shortsCount: -1, createdAt: -1 })
    .limit(limit);

  return res
    .status(200)
    .json(new ApiResponse(200, sounds, "Trending sounds fetched successfully"));
});

// @desc    Get shorts created with a specific sound
// @route   GET /api/v1/sounds/:id/shorts
// @access  Public
const getShortsBySound = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const shorts = await Short.find({ sound: req.params.id, privacy: "public" })
    .populate("owner", "username fullName avatar isVerified")
    .skip(skip)
    .limit(limit)
    .sort({ viewsCount: -1, createdAt: -1 });

  const total = await Short.countDocuments({ sound: req.params.id, privacy: "public" });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        shorts,
        page,
        limit,
        total,
        hasMore: skip + shorts.length < total,
      },
      "Shorts using sound fetched successfully"
    )
  );
});

module.exports = {
  getSoundDetails,
  getTrendingSounds,
  getShortsBySound,
};
