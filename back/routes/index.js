const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const shortRoutes = require("./short.routes");
const commentRoutes = require("./comment.routes");
const soundRoutes = require("./sound.routes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/shorts", shortRoutes);
router.use("/comments", commentRoutes);
router.use("/sounds", soundRoutes);

module.exports = router;
