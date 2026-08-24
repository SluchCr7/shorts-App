const Comment = require("../models/Comment");
const Short = require("../models/Short");
const Like = require("../models/Like");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get comments for a short video
// @route   GET /api/v1/shorts/:id/comments
// @access  Public (Optional Auth)
const getShortComments = asyncHandler(async (req, res) => {
  const shortId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({ short: shortId, parentComment: null })
    .populate("user", "username fullName avatar isVerified")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Comment.countDocuments({ short: shortId, parentComment: null });

  // Get reply counts for top-level comments
  const commentIds = comments.map((c) => c._id);
  const replies = await Comment.aggregate([
    { $match: { parentComment: { $in: commentIds } } },
    { $group: { _id: "$parentComment", count: { $sum: 1 } } },
  ]);

  const replyCountMap = new Map();
  replies.forEach((r) => replyCountMap.set(r._id.toString(), r.count));

  // Check if logged-in user liked these comments
  let likedCommentSet = new Set();
  if (req.user) {
    const userLikes = await Like.find({
      user: req.user._id,
      comment: { $in: commentIds },
    }).select("comment");
    likedCommentSet = new Set(userLikes.map((l) => l.comment.toString()));
  }

  const enrichedComments = comments.map((c) => ({
    ...c.toObject(),
    repliesCount: replyCountMap.get(c._id.toString()) || 0,
    isLiked: likedCommentSet.has(c._id.toString()),
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments: enrichedComments,
        page,
        limit,
        total,
        hasMore: skip + comments.length < total,
      },
      "Comments fetched successfully"
    )
  );
});

// @desc    Add comment to a short video (or reply)
// @route   POST /api/v1/shorts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const shortId = req.params.id;
  const { content, parentCommentId } = req.body;

  const short = await Short.findById(shortId);
  if (!short) {
    throw new ApiError(404, "Short video not found");
  }

  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      throw new ApiError(404, "Parent comment not found");
    }
  }

  const comment = await Comment.create({
    short: shortId,
    user: req.user._id,
    content,
    parentComment: parentCommentId || null,
  });

  await Short.findByIdAndUpdate(shortId, { $inc: { commentsCount: 1 } });

  const populatedComment = await Comment.findById(comment._id).populate(
    "user",
    "username fullName avatar isVerified"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedComment, "Comment posted successfully"));
});

// @desc    Delete comment
// @route   DELETE /api/v1/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  // Delete replies
  const replies = await Comment.find({ parentComment: comment._id });
  const countToDelete = 1 + replies.length;

  await Promise.all([
    Comment.findByIdAndDelete(comment._id),
    Comment.deleteMany({ parentComment: comment._id }),
    Like.deleteMany({ comment: { $in: [comment._id, ...replies.map((r) => r._id)] } }),
    Short.findByIdAndUpdate(comment.short, { $inc: { commentsCount: -countToDelete } }),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

// @desc    Like a comment
// @route   POST /api/v1/comments/:id/like
// @access  Private
const likeComment = asyncHandler(async (req, res) => {
  const commentId = req.params.id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const existingLike = await Like.findOne({
    user: req.user._id,
    comment: commentId,
  });

  if (existingLike) {
    throw new ApiError(400, "Comment is already liked");
  }

  await Like.create({
    user: req.user._id,
    comment: commentId,
  });

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { $inc: { likesCount: 1 } },
    { new: true }
  ).select("likesCount");

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true, likesCount: updatedComment.likesCount }, "Comment liked"));
});

// @desc    Unlike a comment
// @route   DELETE /api/v1/comments/:id/like
// @access  Private
const unlikeComment = asyncHandler(async (req, res) => {
  const commentId = req.params.id;

  const existingLike = await Like.findOneAndDelete({
    user: req.user._id,
    comment: commentId,
  });

  if (!existingLike) {
    throw new ApiError(400, "Comment is not liked yet");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { $inc: { likesCount: -1 } },
    { new: true }
  ).select("likesCount");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked: false, likesCount: Math.max(0, updatedComment.likesCount) },
        "Comment unliked"
      )
    );
});

// @desc    Get nested replies for a comment
// @route   GET /api/v1/comments/:id/replies
// @access  Public (Optional Auth)
const getCommentReplies = asyncHandler(async (req, res) => {
  const commentId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const replies = await Comment.find({ parentComment: commentId })
    .populate("user", "username fullName avatar isVerified")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: 1 });

  const total = await Comment.countDocuments({ parentComment: commentId });

  // Get sub-reply counts
  const replyIds = replies.map((r) => r._id);
  const subReplies = await Comment.aggregate([
    { $match: { parentComment: { $in: replyIds } } },
    { $group: { _id: "$parentComment", count: { $sum: 1 } } },
  ]);

  const subReplyCountMap = new Map();
  subReplies.forEach((sr) => subReplyCountMap.set(sr._id.toString(), sr.count));

  // Check if logged-in user liked these replies
  let likedCommentSet = new Set();
  if (req.user) {
    const userLikes = await Like.find({
      user: req.user._id,
      comment: { $in: replyIds },
    }).select("comment");
    likedCommentSet = new Set(userLikes.map((l) => l.comment.toString()));
  }

  const enrichedReplies = replies.map((r) => ({
    ...r.toObject(),
    repliesCount: subReplyCountMap.get(r._id.toString()) || 0,
    isLiked: likedCommentSet.has(r._id.toString()),
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        replies: enrichedReplies,
        page,
        limit,
        total,
        hasMore: skip + replies.length < total,
      },
      "Comment replies fetched successfully"
    )
  );
});

module.exports = {
  getShortComments,
  getCommentReplies,
  addComment,
  deleteComment,
  likeComment,
  unlikeComment,
};
