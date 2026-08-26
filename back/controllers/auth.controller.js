const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  generateAccessAndRefreshTokens,
  setAuthCookies,
  clearAuthCookies,
} = require("../services/token.service");

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;

  const existingUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });

  if (existingUser) {
    if (existingUser.username === username.toLowerCase()) {
      throw new ApiError(409, "Username already taken");
    }
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    fullName,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Failed to register user");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  setAuthCookies(res, accessToken, refreshToken);

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: createdUser, accessToken, refreshToken },
      "User registered successfully"
    )
  );
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { emailOrUsername, password } = req.body;

  const user = await User.findOne({
    $or: [
      { email: emailOrUsername.toLowerCase() },
      { username: emailOrUsername.toLowerCase() },
    ],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  setAuthCookies(res, accessToken, refreshToken);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(
      200,
      { user: loggedInUser, accessToken, refreshToken },
      "User logged in successfully"
    )
  );
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: "", previousRefreshToken: "" },
    },
    { new: true }
  );

  clearAuthCookies(res);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// @desc    Refresh access & refresh tokens
// @route   POST /api/v1/auth/refresh
// @access  Public (Cookie / Body refresh token)
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (
      incomingRefreshToken !== user?.refreshToken &&
      incomingRefreshToken !== user?.previousRefreshToken
    ) {
      throw new ApiError(401, "Refresh token is expired or invalid");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    setAuthCookies(res, accessToken, newRefreshToken);

    return res.status(200).json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed successfully"
      )
    );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// @desc    Get logged in user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// @desc    Change password
// @route   POST /api/v1/auth/change-password
// @access  Private
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
};
