const Short = require("../models/Short");
const Like = require("../models/Like");
const Save = require("../models/Save");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Toggle Like/Love on a short video (Idempotent & Atomic)
// @route   POST /api/v1/shorts/:id/like or /api/v1/shorts/:id/toggle-like
// @access  Private
const toggleLikeShort = asyncHandler(async (req, res) => {
  const shortId = req.params.id;
  const userId = req.user._id;

  const short = await Short.findById(shortId);
  if (!short) {
    throw new ApiError(404, "Short video not found");
  }

  const targetState =
    typeof req.body?.targetState === "boolean"
      ? req.body.targetState
      : typeof req.body?.isLiked === "boolean"
      ? req.body.isLiked
      : null;

  const existingLike = await Like.findOne({
    user: userId,
    short: shortId,
  });

  let shouldLike = false;
  if (targetState !== null) {
    shouldLike = targetState;
  } else {
    shouldLike = !existingLike;
  }

  if (shouldLike) {
    if (!existingLike) {
      try {
        await Like.create({
          user: userId,
          short: shortId,
        });
        await Short.findByIdAndUpdate(shortId, { $inc: { likesCount: 1 } });
        if (short.owner) {
          await User.findByIdAndUpdate(short.owner, { $inc: { likesCount: 1 } });
        }
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    }
  } else {
    if (existingLike) {
      await Like.findOneAndDelete({
        user: userId,
        short: shortId,
      });
      await Short.findByIdAndUpdate(shortId, { $inc: { likesCount: -1 } });
      if (short.owner) {
        await User.findByIdAndUpdate(short.owner, { $inc: { likesCount: -1 } });
      }
    }
  }

  const updatedShort = await Short.findById(shortId).select("likesCount");
  const actualLikesCount = Math.max(0, updatedShort ? updatedShort.likesCount : 0);
  const actualIsLiked = !!(await Like.exists({ user: userId, short: shortId }));

  return res.status(200).json(
    new ApiResponse(
      200,
      { isLiked: actualIsLiked, likesCount: actualLikesCount },
      actualIsLiked ? "Short liked successfully" : "Short unliked successfully"
    )
  );
});

// Backward compatibility aliases
const likeShort = toggleLikeShort;
const unlikeShort = toggleLikeShort;

// @desc    Toggle Save/Bookmark on a short video (Idempotent & Atomic)
// @route   POST /api/v1/shorts/:id/save or /api/v1/shorts/:id/toggle-save
// @access  Private
const toggleSaveShort = asyncHandler(async (req, res) => {
  const shortId = req.params.id;
  const userId = req.user._id;

  const short = await Short.findById(shortId);
  if (!short) {
    throw new ApiError(404, "Short video not found");
  }

  const targetState =
    typeof req.body?.targetState === "boolean"
      ? req.body.targetState
      : typeof req.body?.isSaved === "boolean"
      ? req.body.isSaved
      : null;

  const existingSave = await Save.findOne({
    user: userId,
    short: shortId,
  });

  let shouldSave = false;
  if (targetState !== null) {
    shouldSave = targetState;
  } else {
    shouldSave = !existingSave;
  }

  if (shouldSave) {
    if (!existingSave) {
      try {
        await Save.create({
          user: userId,
          short: shortId,
        });
        await Short.findByIdAndUpdate(shortId, { $inc: { savesCount: 1 } });
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    }
  } else {
    if (existingSave) {
      await Save.findOneAndDelete({
        user: userId,
        short: shortId,
      });
      await Short.findByIdAndUpdate(shortId, { $inc: { savesCount: -1 } });
    }
  }

  const updatedShort = await Short.findById(shortId).select("savesCount");
  const actualSavesCount = Math.max(0, updatedShort ? updatedShort.savesCount : 0);
  const actualIsSaved = !!(await Save.exists({ user: userId, short: shortId }));

  return res.status(200).json(
    new ApiResponse(
      200,
      { isSaved: actualIsSaved, savesCount: actualSavesCount },
      actualIsSaved ? "Short saved successfully" : "Short unsaved successfully"
    )
  );
});

// Backward compatibility aliases
const unsaveShort = toggleSaveShort;

// @desc    Increment share counter for a short
// @route   POST /api/v1/shorts/:id/share
// @access  Public
const shareShort = asyncHandler(async (req, res) => {
  const targetShort = await Short.findById(req.params.id);

  if (!targetShort) {
    throw new ApiError(404, "Short video not found");
  }

  // Increment sharesCount on target short
  targetShort.sharesCount = (targetShort.sharesCount || 0) + 1;
  await targetShort.save();

  let sharedShortDoc = null;

  // If user is authenticated, create a reposted Short document in their account
  if (req.user) {
    // Resolve root original short so nested reposts point to original creator
    const rootOriginalId = targetShort.originalShort || targetShort._id;
    const body = req.body || {};

    const newShort = await Short.create({
      owner: req.user._id,
      title: body.title || targetShort.title || "Untitled Short",
      description: body.description || targetShort.description || "",
      videoUrl: targetShort.videoUrl,
      videoPublicId: targetShort.videoPublicId,
      thumbnailUrl: targetShort.thumbnailUrl,
      thumbnailPublicId: targetShort.thumbnailPublicId || "",
      duration: targetShort.duration || 0,
      sound: targetShort.sound || null,
      hashtags: targetShort.hashtags || [],
      originalShort: rootOriginalId,
      privacy: "public",
    });

    // Increment shorts count for sharing user
    await User.findByIdAndUpdate(req.user._id, { $inc: { shortsCount: 1 } });

    sharedShortDoc = await Short.findById(newShort._id)
      .populate("owner", "username fullName avatar isVerified")
      .populate({
        path: "originalShort",
        populate: { path: "owner", select: "username fullName avatar isVerified" },
      });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sharesCount: targetShort.sharesCount,
        sharedShort: sharedShortDoc,
      },
      "Short shared successfully"
    )
  );
});


module.exports = {
  toggleLikeShort,
  toggleSaveShort,
  likeShort,
  unlikeShort,
  saveShort,
  unsaveShort,
  shareShort,
};
