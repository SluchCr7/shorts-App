const express = require("express");
const router = express.Router();
const {
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
  verifyAccount,
} = require("../controllers/user.controller");
const { verifyJWT, optionalAuth } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const validate = require("../middlewares/validate.middleware");
const { updateProfileSchema } = require("../validators/user.validator");

// User profile & public data
router.get("/profile/:username", optionalAuth, getUserProfile);
router.get("/:id/followers", getUserFollowers);
router.get("/:id/following", getUserFollowing);
router.get("/:id/shorts", optionalAuth, getUserShorts);
router.get("/:id/liked-shorts", getUserLikedShorts);

// Protected user management routes
router.patch("/profile", verifyJWT, validate(updateProfileSchema), updateAccountDetails);
router.patch("/avatar", verifyJWT, upload.single("avatar"), updateUserAvatar);
router.patch("/cover", verifyJWT, upload.single("coverImage"), updateUserCover);

// Saved shorts (private to user)
router.get("/saved/shorts", verifyJWT, getUserSavedShorts);

// Follow / Unfollow
router.post("/:id/follow", verifyJWT, followUser);
router.post("/:id/unfollow", verifyJWT, unfollowUser);

// Verify account
router.post("/verify", verifyJWT, verifyAccount);

module.exports = router;
