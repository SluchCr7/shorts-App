const express = require("express");
const router = express.Router();
const {
  getSoundDetails,
  getTrendingSounds,
  getShortsBySound,
} = require("../controllers/sound.controller");

router.get("/trending", getTrendingSounds);
router.get("/:id", getSoundDetails);
router.get("/:id/shorts", getShortsBySound);

module.exports = router;
