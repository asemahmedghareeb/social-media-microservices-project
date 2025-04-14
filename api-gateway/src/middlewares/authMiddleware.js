import { FAILED } from "../utils/httpStatus.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    logger.error("Access attempted without a valid token");
    return res
      .status(401)
      .json({ message: "Authentication is required", status: FAILED });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.error("Invalid token");
      return res.status(429).json({ message: "Invalid token", status: FAILED });
    }
    req.user = user;
    next();
  });
};
export { validateToken };