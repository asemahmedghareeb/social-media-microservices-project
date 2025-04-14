import logger from "../utils/logger.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import appError from "../utils/appError.js";
import User from "../models/user.js";
import { SUCCESS, FAILED } from "../utils/httpStatus.js";
import { generateTokens } from "../utils/generateToken.js";
import RefreshToken from "../models/Refresh-token.js";

const registerUser = asyncHandler(async (req, res, next) => {
  logger.info("Registering user...");
  const { username, email, password } = req.body;
  let user = await User.findOne({ email }, { username });
  if (user) {
    logger.warn("User already exists");
    return next(appError.createError("user already exists", 400, FAILED));
  }
  user = await User.create({ username, email, password });
  logger.info("User registered successfully", user._id);

  const { accessToken, refreshToken } = await generateTokens(user);
  res.status(201).json({
    message: "User registered successfully",
    status: SUCCESS,
    data: { accessToken, refreshToken },
  });
});

const loginUser = asyncHandler(async (req, res, next) => {
  logger.info("Logging in user...");
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    logger.warn("User not found");
    return next(appError.createError("User not found", 404, FAILED));
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    logger.warn("Invalid credentials");
    return next(appError.createError("Invalid credentials", 401, FAILED));
  }
  const { accessToken, refreshToken } = await generateTokens(user);
  res.status(200).json({
    message: "User logged in successfully",
    status: SUCCESS,
    data: {
      accessToken,
      refreshToken,
      userId: user._id,
    },
  });
});

const refreshToken = asyncHandler(async (req, res, next) => {
  logger.info("Refreshing token end point hit...");
  const { refreshToken } = req.body;
  if (!refreshToken) {
    logger.warn("Refresh token not provided");
    return next(
      appError.createError("Refresh token not provided", 400, FAILED)
    );
  }
  const storedToken = await RefreshToken.findOne({
    token: refreshToken,
  });
  if (!storedToken || storedToken.expired <= new Date()) {
    logger.warn("Invalid or expired refresh token");
    return next(appError.createError("Invalid refresh token", 401, FAILED));
  }

  const user = await User.findById(storedToken.userId);
  if (!user) {
    logger.warn("User not found");
    return next(appError.createError("User not found", 404, FAILED));
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
    user
  );

  await RefreshToken.deleteOne({ _id: storedToken._id });
  logger.info("Token refreshed successfully");
  res.status(200).json({
    message: "Token refreshed successfully",
    status: SUCCESS,
    data: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  });
});

const logoutUser = asyncHandler(async (req, res, next) => {
  logger.info("Logout endpoint hit...");
  const { refreshToken } = req.body;
  if (!refreshToken) {
    logger.warn("Refresh token not provided");
    return next(
      appError.createError("Refresh token not provided", 400, FAILED)
    );
  }

  const storedToken = await RefreshToken.findOne({ token: refreshToken });
  if (!storedToken || storedToken.expired <= new Date()) {
    logger.warn("the Refresh token not found or expired");
    return next(
      appError.createError(
        "the Refresh token not found or expired ",
        404,
        FAILED
      )
    );
  }

  await RefreshToken.deleteOne({ token: refreshToken });

  logger.info("User logged out successfully");
  res.status(200).json({
    message: "User logged out successfully",
    status: SUCCESS,
  });
});
export { registerUser, loginUser, refreshToken, logoutUser };
