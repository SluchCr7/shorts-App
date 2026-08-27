const express = require("express");
const router = express.Router();
const {
  uploadShort,
  getShortsFeed,
  getShortById,
  updateShort,
  deleteShort,
  searchShorts,
  incrementShortView,
} = require("../controllers/short.controller");
const {
  toggleLikeShort,
  toggleSaveShort,
  likeShort,
  unlikeShort,
  saveShort,
  unsaveShort,
  shareShort,
} = require("../controllers/interaction.controller");
const {
  getShortComments,
  addComment,
} = require("../controllers/comment.controller");
const { verifyJWT, optionalAuth } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createShortSchema,
  updateShortSchema,
} = require("../validators/short.validator");
const { addCommentSchema } = require("../validators/comment.validator");

// Feed & Discovery
router.get("/feed", optionalAuth, getShortsFeed);
router.get("/search", optionalAuth, searchShorts);

// Single short CRUD
router.post(
  "/",
  verifyJWT,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  validate(createShortSchema),
  uploadShort
);

router.get("/:id", optionalAuth, getShortById);
router.patch("/:id", verifyJWT, validate(updateShortSchema), updateShort);
router.delete("/:id", verifyJWT, deleteShort);

// Views & Shares
router.post("/:id/view", incrementShortView);
router.post("/:id/share", optionalAuth, shareShort);

// Interactions (Likes & Saves - Unified Toggle Endpoints)
router.post("/:id/like", verifyJWT, toggleLikeShort);
router.post("/:id/toggle-like", verifyJWT, toggleLikeShort);
router.delete("/:id/like", verifyJWT, toggleLikeShort);

router.post("/:id/save", verifyJWT, toggleSaveShort);
router.post("/:id/toggle-save", verifyJWT, toggleSaveShort);
router.delete("/:id/save", verifyJWT, toggleSaveShort);

// Comments for Short
router.get("/:id/comments", optionalAuth, getShortComments);
router.post("/:id/comments", verifyJWT, validate(addCommentSchema), addComment);

module.exports = router;
