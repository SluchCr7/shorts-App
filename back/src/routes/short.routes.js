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
router.post("/:id/share", shareShort);

// Interactions (Likes & Saves)
router.post("/:id/like", verifyJWT, likeShort);
router.delete("/:id/like", verifyJWT, unlikeShort);
router.post("/:id/save", verifyJWT, saveShort);
router.delete("/:id/save", verifyJWT, unsaveShort);

// Comments for Short
router.get("/:id/comments", optionalAuth, getShortComments);
router.post("/:id/comments", verifyJWT, validate(addCommentSchema), addComment);

module.exports = router;
