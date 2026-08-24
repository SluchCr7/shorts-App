const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
} = require("../controllers/auth.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require("../validators/auth.validator");

// Public Auth routes
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/refresh", refreshAccessToken);

// Protected Auth routes
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);
router.post(
  "/change-password",
  verifyJWT,
  validate(changePasswordSchema),
  changeCurrentPassword
);

module.exports = router;
