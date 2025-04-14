import { asyncHandler } from "./errorHandler.js";
import logger from "../utils/logger.js";
import { ERROR } from "../utils/httpStatus.js";
const handleNotFoundResource = asyncHandler(async (req, res, next) => {
  logger.info(`received: ${req.method} request to ${req.url}`);
  logger.info(`request body: ${req.body}`);
  res.status(404).json({
    status: ERROR,
    message: "this Route is not found",
  });
});

export default handleNotFoundResource;
