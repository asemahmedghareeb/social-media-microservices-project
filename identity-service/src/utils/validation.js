import joi from "joi";
import { asyncHandler } from "../middlewares/errorHandler.js";
import appError from "./appError.js";
import { FAILED } from "./httpStatus.js";
import logger from "./logger.js";

const validateRegistration = asyncHandler(async (req, res, next) => {
  const schema = joi.object({
    username: joi.string().min(3).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    logger.warn("Validation error", error.details[0].message);
    return next(appError.createError(error.details[0].message, 400, FAILED));
  }
  next();
});

const validateLogin = asyncHandler(async (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    logger.warn("Validation error", error.details[0].message);
    return next(appError.createError(error.details[0].message, 400, FAILED));
  }
  next();
});

export { validateRegistration, validateLogin };
