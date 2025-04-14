import { FAILED } from "../utils/httpStatus.js";
import logger from "../utils/logger.js";
const authenticateRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    logger.error("access attempted without userid");
    return res
      .status(401)
      .json({ status: FAILED, message: "Authentication is required" });
  }
  req.user = { userId };
  next();
};

export { authenticateRequest };
