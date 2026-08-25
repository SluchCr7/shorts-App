const Short = require("../models/Short");
const User = require("../models/User");
const Like = require("../models/Like");
const Save = require("../models/Save");
const Follow = require("../models/Follow");
const Comment = require("../models/Comment");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { uploadOnCloudinary, deleteFromCloudinary } = require("../services/cloudinary.service");

// Helper to extract hashtags from description text
const extractHashtags = (text) => {
  if (!text) return [];
  const matches = text.match(/#[\w\u0590-\u05ff]+/g);
  if (!matches) return [];
  return matches.map((tag) => tag.replace("#", "").toLowerCase());
};

// Helper to enrich short objects with user interactions (isLiked, isSaved)
const enrichShortsWithInteractions = async (shorts, userId) => {
  if (!userId) {
    return shorts.map((short) => ({
      ...short.toObject(),
      isLiked: false,
      isSaved: false,
    }));
  }

  const shortIds = shorts.map((s) => s._id);

  const [userLikes, userSaves] = await Promise.all([
    Like.find({ user: userId, short: { $in: shortIds } }).select("short"),
    Save.find({ user: userId, short: { $in: shortIds } }).select("short"),
  ]);

  const likedSet = new Set(userLikes.map((l) => l.short.toString()));
  const savedSet = new Set(userSaves.map((s) => s.short.toString()));

  return shorts.map((short) => ({
    ...short.toObject(),
    isLiked: likedSet.has(short._id.toString()),
    isSaved: savedSet.has(short._id.toString()),
  }));
};

const { processVideo, extractThumbnail, cleanupFiles } = require("../services/ffmpeg.service");
const path = require("path");
const fs = require("fs");
const os = require("os");

// @desc    Upload a new video short
// @route   POST /api/v1/shorts
// @access  Private
const uploadShort = asyncHandler(async (req, res) => {
  const { title, description, soundId, privacy, startTime, duration } = req.body;

  const videoFile = req.files?.video ? req.files.video[0] : null;
  const thumbnailFile = req.files?.thumbnail ? req.files.thumbnail[0] : null;

  if (!videoFile) {
    throw new ApiError(400, "Video file is required");
  }

  const filesToCleanup = [];
  if (videoFile.path) filesToCleanup.push(videoFile.path);
  if (thumbnailFile?.path) filesToCleanup.push(thumbnailFile.path);

  let finalVideoPath = videoFile.path;
  const tempDir = videoFile.destination || (videoFile.path ? path.dirname(videoFile.path) : os.tmpdir());
  const processedVideoPath = path.join(tempDir, `trimmed-${Date.now()}-${path.basename(videoFile.path || "video.mp4")}`);

  try {
    // Attempt FFmpeg video trimming & scaling
    try {
      await processVideo({
        inputPath: videoFile.path,
        startTime: startTime !== undefined ? parseFloat(startTime) : 0,
        duration: duration !== undefined ? parseFloat(duration) : 60,
        outputPath: processedVideoPath,
      });
      finalVideoPath = processedVideoPath;
      filesToCleanup.push(processedVideoPath);
    } catch (ffmpegErr) {
      console.warn("FFmpeg processing warning (falling back to original video):", ffmpegErr.message);
      finalVideoPath = videoFile.path;
    }

    // Upload video to Cloudinary
    const videoResult = await uploadOnCloudinary(
      finalVideoPath || videoFile.buffer,
      "shorts_videos",
      "video"
    );

    let thumbnailUrl = "";
    let thumbnailPublicId = "";

    if (thumbnailFile) {
      const thumbResult = await uploadOnCloudinary(
        thumbnailFile.path || thumbnailFile.buffer,
        "shorts_thumbnails",
        "image"
      );
      thumbnailUrl = thumbResult.secure_url;
      thumbnailPublicId = thumbResult.public_id;
    } else {
      // Try to extract thumbnail using FFmpeg if possible
      const extractedThumbPath = path.join(tempDir, `thumb-${Date.now()}.jpg`);
      try {
        await extractThumbnail({
          inputPath: videoFile.path,
          timestamp: startTime ? parseFloat(startTime) : 0,
          outputPath: extractedThumbPath,
        });
        filesToCleanup.push(extractedThumbPath);
        const thumbResult = await uploadOnCloudinary(extractedThumbPath, "shorts_thumbnails", "image");
        thumbnailUrl = thumbResult.secure_url;
        thumbnailPublicId = thumbResult.public_id;
      } catch (thumbErr) {
        console.warn("FFmpeg thumbnail extraction fallback:", thumbErr.message);
        thumbnailUrl = videoResult.secure_url ? videoResult.secure_url.replace(/\.[^/.]+$/, ".jpg") : "";
      }
    }

    const hashtags = extractHashtags(description);
    const parsedDuration = duration ? Math.round(parseFloat(duration)) : Math.round(videoResult.duration || 0);

    const short = await Short.create({
      owner: req.user._id,
      title,
      description: description || "",
      videoUrl: videoResult.secure_url,
      videoPublicId: videoResult.public_id,
      thumbnailUrl,
      thumbnailPublicId,
      duration: parsedDuration,
      sound: soundId || null,
      hashtags,
      privacy: privacy || "public",
    });

    // Increment user shorts count
    await User.findByIdAndUpdate(req.user._id, { $inc: { shortsCount: 1 } });

    const populatedShort = await Short.findById(short._id).populate(
      "owner",
      "username fullName avatar isVerified"
    );

    return res
      .status(201)
      .json(new ApiResponse(201, populatedShort, "Video short uploaded successfully"));
  } finally {
    // Always clean up temp files on disk
    await cleanupFiles(filesToCleanup);
  }
});

// @desc    Get video shorts feed (for-you or following)
// @route   GET /api/v1/shorts/feed
// @access  Public (Optional Auth)
const getShortsFeed = asyncHandler(async (req, res) => {
  const feedType = req.query.type || "for-you"; // 'for-you' | 'following'
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = { privacy: "public" };

  if (feedType === "following") {
    if (!req.user) {
      throw new ApiError(401, "Authentication required for following feed");
    }

    const followingDocs = await Follow.find({ follower: req.user._id }).select("following");
    const followingIds = followingDocs.map((f) => f.following);

    query.owner = { $in: followingIds };
  }

  const shorts = await Short.find(query)
    .populate("owner", "username fullName avatar isVerified bio")
    .populate({
      path: "originalShort",
      populate: { path: "owner", select: "username fullName avatar isVerified" },
    })
    .populate("sound", "title audioUrl duration")
    .skip(skip)
    .limit(limit)
    .sort(feedType === "following" ? { createdAt: -1 } : { viewsCount: -1, createdAt: -1 });

  const total = await Short.countDocuments(query);
  const enrichedShorts = await enrichShortsWithInteractions(shorts, req.user?._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        shorts: enrichedShorts,
        page,
        limit,
        total,
        hasMore: skip + shorts.length < total,
      },
      "Shorts feed fetched successfully"
    )
  );
});

// @desc    Get short details by ID
// @route   GET /api/v1/shorts/:id
// @access  Public (Optional Auth)
const getShortById = asyncHandler(async (req, res) => {
  const short = await Short.findById(req.params.id)
    .populate("owner", "username fullName avatar isVerified bio followersCount")
    .populate({
      path: "originalShort",
      populate: { path: "owner", select: "username fullName avatar isVerified" },
    })
    .populate("sound", "title audioUrl creator duration");

  if (!short) {
    throw new ApiError(404, "Short video not found");
  }

  // Check privacy
  if (short.privacy === "private") {
    if (!req.user || req.user._id.toString() !== short.owner._id.toString()) {
      throw new ApiError(403, "This short video is private");
    }
  }

  let isLiked = false;
  let isSaved = false;
  let isFollowingOwner = false;

  if (req.user) {
    const [likeDoc, saveDoc, followDoc] = await Promise.all([
      Like.findOne({ user: req.user._id, short: short._id }),
      Save.findOne({ user: req.user._id, short: short._id }),
      Follow.findOne({ follower: req.user._id, following: short.owner._id }),
    ]);

    isLiked = !!likeDoc;
    isSaved = !!saveDoc;
    isFollowingOwner = !!followDoc;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...short.toObject(),
        isLiked,
        isSaved,
        isFollowingOwner,
      },
      "Short details fetched successfully"
    )
  );
});

// @desc    Update short details
// @route   PATCH /api/v1/shorts/:id
// @access  Private
const updateShort = asyncHandler(async (req, res) => {
  const short = await Short.findById(req.params.id);

  if (!short) {
    throw new ApiError(404, "Short video not found");
  }

  if (short.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this short");
  }

  const { title, description, privacy } = req.body;
  const updateFields = {};

  if (title !== undefined) updateFields.title = title;
  if (description !== undefined) {
    updateFields.description = description;
    updateFields.hashtags = extractHashtags(description);
  }
  if (privacy !== undefined) updateFields.privacy = privacy;

  const updatedShort = await Short.findByIdAndUpdate(
    req.params.id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).populate("owner", "username fullName avatar isVerified");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedShort, "Short updated successfully"));
});

// @desc    Delete short
// @route   DELETE /api/v1/shorts/:id
// @access  Private
const deleteShort = asyncHandler(async (req, res) => {
  const short = await Short.findById(req.params.id);

  if (!short) {
    throw new ApiError(404, "Short video not found");
  }

  if (short.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this short");
  }

  // Delete video and thumbnail from Cloudinary
  if (short.videoPublicId) {
    await deleteFromCloudinary(short.videoPublicId, "video");
  }
  if (short.thumbnailPublicId) {
    await deleteFromCloudinary(short.thumbnailPublicId, "image");
  }

  // Delete associated records
  await Promise.all([
    Short.findByIdAndDelete(req.params.id),
    Like.deleteMany({ short: req.params.id }),
    Save.deleteMany({ short: req.params.id }),
    Comment.deleteMany({ short: req.params.id }),
    User.findByIdAndUpdate(req.user._id, { $inc: { shortsCount: -1 } }),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Short video deleted successfully"));
});

// @desc    Search shorts by title, description or hashtag
// @route   GET /api/v1/shorts/search
// @access  Public (Optional Auth)
const searchShorts = asyncHandler(async (req, res) => {
  const { q, tag } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = { privacy: "public" };

  if (tag) {
    query.hashtags = tag.toLowerCase().replace("#", "");
  } else if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { hashtags: { $in: [q.toLowerCase().replace("#", "")] } },
    ];
  }

  const shorts = await Short.find(query)
    .populate("owner", "username fullName avatar isVerified")
    .populate({
      path: "originalShort",
      populate: { path: "owner", select: "username fullName avatar isVerified" },
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Short.countDocuments(query);
  const enrichedShorts = await enrichShortsWithInteractions(shorts, req.user?._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        shorts: enrichedShorts,
        page,
        limit,
        total,
        hasMore: skip + shorts.length < total,
      },
      "Shorts search results fetched successfully"
    )
  );
});

// @desc    Increment short view counter
// @route   POST /api/v1/shorts/:id/view
// @access  Public
const incrementShortView = asyncHandler(async (req, res) => {
  const short = await Short.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewsCount: 1 } },
    { new: true }
  ).select("viewsCount");

  if (!short) {
    throw new ApiError(404, "Short video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { viewsCount: short.viewsCount }, "View incremented"));
});

module.exports = {
  uploadShort,
  getShortsFeed,
  getShortById,
  updateShort,
  deleteShort,
  searchShorts,
  incrementShortView,
};
