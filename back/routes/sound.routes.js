const express = require("express");
const router = express.Router();
const {
  getAudios,
  getSoundDetails,
  getTrendingSounds,
  getShortsBySound,
  uploadAudioTrack,
} = require("../controllers/sound.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

router.get("/", getAudios);
router.get("/trending", getTrendingSounds);
router.get("/:id", getSoundDetails);
router.get("/:id/shorts", getShortsBySound);

router.post(
  "/upload",
  verifyJWT,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  uploadAudioTrack
);

module.exports = router;
