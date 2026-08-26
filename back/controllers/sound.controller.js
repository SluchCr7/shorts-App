const Sound = require("../models/Sound");
const Short = require("../models/Short");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { uploadOnCloudinary } = require("../services/cloudinary.service");
const { cleanupFiles } = require("../services/ffmpeg.service");

// @desc    Get paginated audio tracks with search and trending sort
// @route   GET /api/v1/audios or /api/v1/sounds
// @access  Public
const getAudios = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || req.query.q || "";
  const skip = (page - 1) * limit;

  const query = {};
  if (search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { artist: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const sounds = await Sound.find(query)
    .populate("creator createdBy", "username fullName avatar")
    .skip(skip)
    .limit(limit)
    .sort({ usesCount: -1, shortsCount: -1, createdAt: -1 });

  const total = await Sound.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        audios: sounds,
        sounds,
        page,
        limit,
        total,
        hasMore: skip + sounds.length < total,
      },
      "Audio tracks fetched successfully"
    )
  );
});

// @desc    Get sound/audio details by ID
// @route   GET /api/v1/sounds/:id or /api/v1/audios/:id
// @access  Public
const getSoundDetails = asyncHandler(async (req, res) => {
  const sound = await Sound.findById(req.params.id).populate(
    "creator createdBy",
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
// @route   GET /api/v1/sounds/trending or /api/v1/audios/trending
// @access  Public
const getTrendingSounds = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  const sounds = await Sound.find()
    .populate("creator createdBy", "username fullName avatar")
    .sort({ usesCount: -1, shortsCount: -1, createdAt: -1 })
    .limit(limit);

  return res
    .status(200)
    .json(new ApiResponse(200, sounds, "Trending sounds fetched successfully"));
});

// @desc    Get shorts created with a specific sound
// @route   GET /api/v1/sounds/:id/shorts or /api/v1/audios/:id/shorts
// @access  Public
const getShortsBySound = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {
    $or: [{ sound: req.params.id }, { audioId: req.params.id }],
    privacy: "public",
  };

  const shorts = await Short.find(filter)
    .populate("owner", "username fullName avatar isVerified")
    .populate("sound audioId")
    .skip(skip)
    .limit(limit)
    .sort({ viewsCount: -1, createdAt: -1 });

  const total = await Short.countDocuments(filter);

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

// @desc    Upload a new audio track
// @route   POST /api/v1/audios/upload or /api/v1/sounds/upload
// @access  Private
const uploadAudioTrack = asyncHandler(async (req, res) => {
  const { title, artist, duration } = req.body;

  const audioFile = req.files?.audio ? req.files.audio[0] : req.file;
  const coverFile = req.files?.coverImage ? req.files.coverImage[0] : null;

  if (!title || !title.trim()) {
    throw new ApiError(400, "Audio title is required");
  }

  if (!audioFile) {
    throw new ApiError(400, "Audio file is required (.mp3, .wav, .m4a)");
  }

  const filesToCleanup = [audioFile.path];
  if (coverFile?.path) filesToCleanup.push(coverFile.path);

  try {
    const audioResult = await uploadOnCloudinary(audioFile.path, "shorts_audios", "video");

    let coverUrl = "";
    if (coverFile) {
      const coverResult = await uploadOnCloudinary(coverFile.path, "shorts_audio_covers", "image");
      if (coverResult?.secure_url) {
        coverUrl = coverResult.secure_url;
      }
    }

    const sound = await Sound.create({
      title: title.trim(),
      artist: artist && artist.trim() ? artist.trim() : req.user?.fullName || "Original Sound",
      audioUrl: audioResult.secure_url,
      audioPublicId: audioResult.public_id,
      coverImage: coverUrl,
      duration: duration ? parseFloat(duration) : 0,
      creator: req.user?._id || null,
      createdBy: req.user?._id || null,
      usesCount: 0,
      shortsCount: 0,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, sound, "Audio track uploaded successfully"));
  } finally {
    await cleanupFiles(filesToCleanup);
  }
});

module.exports = {
  getAudios,
  getSoundDetails,
  getTrendingSounds,
  getShortsBySound,
  uploadAudioTrack,
};
