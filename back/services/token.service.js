const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  const options = getCookieOptions();

  // Access Token Cookie (1 day in production to avoid premature logout on tab close)
  const accessMaxAge = 24 * 60 * 60 * 1000;
  res.cookie("accessToken", accessToken, {
    ...options,
    maxAge: accessMaxAge,
  });

  // Refresh Token Cookie (7 days by default)
  const refreshMaxAge = 7 * 24 * 60 * 60 * 1000;
  res.cookie("refreshToken", refreshToken, {
    ...options,
    maxAge: refreshMaxAge,
  });
};

const clearAuthCookies = (res) => {
  const options = getCookieOptions();
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
};

module.exports = {
  getCookieOptions,
  generateAccessAndRefreshTokens,
  setAuthCookies,
  clearAuthCookies,
};
