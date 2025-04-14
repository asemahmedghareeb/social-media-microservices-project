import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/Refresh-token.js";
const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  const refreshToken = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await RefreshToken.create({
    token: refreshToken,
    userId: user._id,
    expiresAt,
  });
  return { accessToken, refreshToken };
};
export { generateTokens };