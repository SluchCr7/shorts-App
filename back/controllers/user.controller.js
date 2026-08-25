const User = require("../models/User");
const Follow = require("../models/Follow");
const Short = require("../models/Short");
const Like = require("../models/Like");
const Save = require("../models/Save");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { uploadOnCloudinary, deleteFromCloudinary } = require("../services/cloudinary.service");

// @desc    Get user profile by username
// @route   GET /api/v1/users/profile/:username
// @access  Public (Optional Auth)
const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username: username.toLowerCase() }).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User profile not found");
  }

  let isFollowing = false;
  let isSelf = false;

  if (req.user) {
    if (req.user._id.toString() === user._id.toString()) {
      isSelf = true;
    } else {
      const followRelation = await Follow.findOne({
        follower: req.user._id,
        following: user._id,
      });
      isFollowing = !!followRelation;
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...user.toObject(),
        isFollowing,
        isSelf,
      },
      "User profile fetched successfully"
    )
  );
});

// @desc    Update account details (fullName, bio, website)
// @route   PATCH /api/v1/users/profile
// @access  Private
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, bio, website, isVerified } = req.body;

  const updateFields = {};
  if (fullName !== undefined) updateFields.fullName = fullName;
  if (bio !== undefined) updateFields.bio = bio;
  if (website !== undefined) updateFields.website = website;
  if (isVerified !== undefined) updateFields.isVerified = Boolean(isVerified);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// @desc    Update user avatar
// @route   PATCH /api/v1/users/avatar
// @access  Private
const updateUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Avatar image file is required");
  }

  const cloudResult = await uploadOnCloudinary(req.file.buffer, "avatars", "image");

  if (req.user.avatarPublicId) {
    await deleteFromCloudinary(req.user.avatarPublicId, "image");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: cloudResult.secure_url,
        avatarPublicId: cloudResult.public_id,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

// @desc    Update user cover image
// @route   PATCH /api/v1/users/cover
// @access  Private
const updateUserCover = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Cover image file is required");
  }

  const cloudResult = await uploadOnCloudinary(req.file.buffer, "covers", "image");

  if (req.user.coverPublicId) {
    await deleteFromCloudinary(req.user.coverPublicId, "image");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: cloudResult.secure_url,
        coverPublicId: cloudResult.public_id,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Cover image updated successfully"));
});

// @desc    Follow a user
// @route   POST /api/v1/users/:id/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;

  if (targetUserId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new ApiError(404, "User to follow not found");
  }

  const existingFollow = await Follow.findOne({
    follower: req.user._id,
    following: targetUserId,
  });

  if (existingFollow) {
    throw new ApiError(400, "You are already following this user");
  }

  await Follow.create({
    follower: req.user._id,
    following: targetUserId,
  });

  await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
  await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, { isFollowing: true }, "User followed successfully"));
});

// @desc    Unfollow a user
// @route   POST /api/v1/users/:id/unfollow
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;

  const existingFollow = await Follow.findOneAndDelete({
    follower: req.user._id,
    following: targetUserId,
  });

  if (!existingFollow) {
    throw new ApiError(400, "You are not following this user");
  }

  await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
  await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, { isFollowing: false }, "User unfollowed successfully"));
});

// @desc    Get user followers
// @route   GET /api/v1/users/:id/followers
// @access  Public
const getUserFollowers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const followers = await Follow.find({ following: req.params.id })
    .populate("follower", "username fullName avatar isVerified bio")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Follow.countDocuments({ following: req.params.id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        followers: followers.map((f) => f.follower),
        page,
        limit,
        total,
        hasMore: skip + followers.length < total,
      },
      "Followers fetched successfully"
    )
  );
});

// @desc    Get user following
// @route   GET /api/v1/users/:id/following
// @access  Public
const getUserFollowing = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const following = await Follow.find({ follower: req.params.id })
    .populate("following", "username fullName avatar isVerified bio")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Follow.countDocuments({ follower: req.params.id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        following: following.map((f) => f.following),
        page,
        limit,
        total,
        hasMore: skip + following.length < total,
      },
      "Following fetched successfully"
    )
  );
});

// @desc    Get shorts created by a user
// @route   GET /api/v1/users/:id/shorts
// @access  Public (Optional Auth)
const getUserShorts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const isOwner = req.user && req.user._id.toString() === req.params.id;
  const query = { owner: req.params.id };

  if (!isOwner) {
    query.privacy = "public";
  }

  const shorts = await Short.find(query)
    .populate("owner", "username fullName avatar isVerified")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Short.countDocuments(query);

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
      "User shorts fetched successfully"
    )
  );
});

// @desc    Get shorts liked by a user
// @route   GET /api/v1/users/:id/liked-shorts
// @access  Public
const getUserLikedShorts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const likes = await Like.find({ user: req.params.id, short: { $ne: null } })
    .populate({
      path: "short",
      populate: { path: "owner", select: "username fullName avatar isVerified" },
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const validShorts = likes.map((l) => l.short).filter(Boolean);
  const total = await Like.countDocuments({ user: req.params.id, short: { $ne: null } });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        shorts: validShorts,
        page,
        limit,
        total,
        hasMore: skip + likes.length < total,
      },
      "Liked shorts fetched successfully"
    )
  );
});

// @desc    Get shorts saved by a user
// @route   GET /api/v1/users/saved-shorts
// @access  Private
const getUserSavedShorts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const saves = await Save.find({ user: req.user._id })
    .populate({
      path: "short",
      populate: { path: "owner", select: "username fullName avatar isVerified" },
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const validShorts = saves.map((s) => s.short).filter(Boolean);
  const total = await Save.countDocuments({ user: req.user._id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        shorts: validShorts,
        page,
        limit,
        total,
        hasMore: skip + saves.length < total,
      },
      "Saved shorts fetched successfully"
    )
  );
});

// @desc    Verify user
// @route   GET /api/v1/users/verify
// @access  Private

const verifyAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "User is already verified");
  }

  user.isVerified = true;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User verified successfully"));
});


module.exports = {
  getUserProfile,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCover,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  getUserShorts,
  getUserLikedShorts,
  getUserSavedShorts,
  verifyAccount
};
