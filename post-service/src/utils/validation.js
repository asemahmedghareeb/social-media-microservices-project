import joi from "joi";
import { asyncHandler } from "../../../media-service/src/middlewares/errorHandler.js";
import appError from "./appError.js";
import { FAILED } from "./httpStatus.js";
import logger from "./logger.js";

const postValidation = asyncHandler(async (req, res, next) => {
  const schema = joi.object({
    content: joi.string().min(3).max(500).required(),
    mediaIds: joi.array()
  });
  const { error } = schema.validate(req.body);
  if (error) {
    logger.warn("Validation error", error.details[0].message);
    return next(appError.createError(error.details[0].message, 400, FAILED));
  }
  next();
});


export { postValidation };
