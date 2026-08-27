const express = require("express");
const router = express.Router();
const {
  getCommentReplies,
  deleteComment,
  toggleLikeComment,
  likeComment,
  unlikeComment,
} = require("../controllers/comment.controller");
const { verifyJWT, optionalAuth } = require("../middlewares/auth.middleware");

// Comment operations
router.get("/:id/replies", optionalAuth, getCommentReplies);
router.delete("/:id", verifyJWT, deleteComment);
router.post("/:id/like", verifyJWT, toggleLikeComment);
router.post("/:id/toggle-like", verifyJWT, toggleLikeComment);
router.delete("/:id/like", verifyJWT, toggleLikeComment);

module.exports = router;
