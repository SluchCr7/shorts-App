const express = require("express");
const router = express.Router();
const {
  getCommentReplies,
  deleteComment,
  likeComment,
  unlikeComment,
} = require("../controllers/comment.controller");
const { verifyJWT, optionalAuth } = require("../middlewares/auth.middleware");

// Comment operations
router.get("/:id/replies", optionalAuth, getCommentReplies);
router.delete("/:id", verifyJWT, deleteComment);
router.post("/:id/like", verifyJWT, likeComment);
router.delete("/:id/like", verifyJWT, unlikeComment);

module.exports = router;
