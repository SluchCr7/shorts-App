const Short = require("../models/Short");
const Like = require("../models/Like");
const Save = require("../models/Save");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Like a short video
// @route   POST /api/v1/shorts/:id/like
// @access  Private
const likeShort = asyncHandler(async (req, res) => {
  const shortId = req.params.id;

  const short = await Short.findById(shortId);
  if (!short) {
    throw new ApiError(404, "Short video not found");
  }

  const existingLike = await Like.findOne({
    user: req.user._id,
    short: shortId,
  });

  if (existingLike) {
    throw new ApiError(400, "Short is already liked");
  }

  await Like.create({
    user: req.user._id,
    short: shortId,
  });

  const updatedShort = await Short.findByIdAndUpdate(
    shortId,
    { $inc: { likesCount: 1 } },
    { new: true }
  ).select("likesCount");

  // Increment overall likes count for video creator
  await User.findByIdAndUpdate(short.owner, { $inc: { likesCount: 1 } });

  return res.status(200).json(
    new ApiResponse(
      200,
      { isLiked: true, likesCount: updatedShort.likesCount },
      "Short liked successfully"
    )
  );
});

// @desc    Unlike a short video
// @route   DELETE /api/v1/shorts/:id/like
// @access  Private
const unlikeShort = asyncHandler(async (req, res) => {
  const shortId = req.params.id;

  const short = await Short.findById(shortId);
  if (!short) {
    throw new ApiError(404, "Short video not found");
  }

  const existingLike = await Like.findOneAndDelete({
    user: req.user._id,
    short: shortId,
  });

  if (!existingLike) {
    throw new ApiError(400, "Short is not liked yet");
  }

  const updatedShort = await Short.findByIdAndUpdate(
    shortId,
    { $inc: { likesCount: -1 } },
    { new: true }
  ).select("likesCount");

  // Decrement overall likes count for video creator
  await User.findByIdAndUpdate(short.owner, { $inc: { likesCount: -1 } });

  return res.status(200).json(
    new ApiResponse(
      200,
      { isLiked: false, likesCount: Math.max(0, updatedShort.likesCount) },
      "Short unliked successfully"
    )
  );
});

// @desc    Save/Bookmark a short video
// @route   POST /api/v1/shorts/:id/save
// @access  Private
const saveShort = asyncHandler(async (req, res) => {
  const shortId = req.params.id;

  const short = await Short.findById(shortId);
  if (!short) {
    throw new ApiError(404, "Short video not found");
  }

  const existingSave = await Save.findOne({
    user: req.user._id,
    short: shortId,
  });

  if (existingSave) {
    throw new ApiError(400, "Short is already saved");
  }

  await Save.create({
    user: req.user._id,
    short: shortId,
  });

  const updatedShort = await Short.findByIdAndUpdate(
    shortId,
    { $inc: { savesCount: 1 } },
    { new: true }
  ).select("savesCount");

  return res.status(200).json(
    new ApiResponse(
      200,
      { isSaved: true, savesCount: updatedShort.savesCount },
      "Short saved successfully"
    )
  );
});

// @desc    Unsave/Remove bookmark from a short video
// @route   DELETE /api/v1/shorts/:id/save
// @access  Private
const unsaveShort = asyncHandler(async (req, res) => {
  const shortId = req.params.id;

  const short = await Short.findById(shortId);
  if (!short) {
    throw new ApiError(404, "Short video not found");
  }

  const existingSave = await Save.findOneAndDelete({
    user: req.user._id,
    short: shortId,
  });

  if (!existingSave) {
    throw new ApiError(400, "Short is not saved");
  }

  const updatedShort = await Short.findByIdAndUpdate(
    shortId,
    { $inc: { savesCount: -1 } },
    { new: true }
  ).select("savesCount");

  return res.status(200).json(
    new ApiResponse(
      200,
      { isSaved: false, savesCount: Math.max(0, updatedShort.savesCount) },
      "Short unsaved successfully"
    )
  );
});

// @desc    Increment share counter for a short
// @route   POST /api/v1/shorts/:id/share
// @access  Public
const shareShort = asyncHandler(async (req, res) => {
  const short = await Short.findByIdAndUpdate(
    req.params.id,
    { $inc: { sharesCount: 1 } },
    { new: true }
  ).select("sharesCount");

  if (!short) {
    throw new ApiError(404, "Short video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { sharesCount: short.sharesCount }, "Share count updated"));
});

module.exports = {
  likeShort,
  unlikeShort,
  saveShort,
  unsaveShort,
  shareShort,
};
