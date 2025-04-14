import { asyncHandler } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";
import appError from "../utils/appError.js";
import { FAILED, SUCCESS } from "../utils/httpStatus.js";
import Media from "../models/Media.js";
import { uploadMediaToCloudinary } from "../utils/cloudinary.js";
const uploadMedia = asyncHandler(async (req, res, next) => {
  logger.info("uploadMedia endpoint hit");

  if (!req.file) {
    logger.error("No file found. Please add a file and try again!");
    return next(
      appError.createError(
        "No file found. Please add a file and try again!", 
        400,
        FAILED 
      )
    );
  }
 
  const { originalname, mimetype } = req.file;
  const userId = req.user.userId;

  logger.info(`File details: name=${originalname}, type=${mimetype}`);
  logger.info("Uploading to cloudinary starting...");

  const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
  logger.info("Uploading to cloudinary completed");
  logger.info(
    `Cloudinary upload successfully. Public Id: - ${cloudinaryUploadResult.public_id}`
  );

  const newlyCreatedMedia = new Media({
    publicId: cloudinaryUploadResult.public_id,
    originalName: originalname,
    mimeType: mimetype,
    url: cloudinaryUploadResult.secure_url,
    userId,
  });

  await newlyCreatedMedia.save();

  res.status(201).json({
    status: SUCCESS,
    data: {
      mediaId: newlyCreatedMedia._id,
      url: newlyCreatedMedia.url,
      message: "Media upload is successfully",
    },
  });
});

const getAllMedia = asyncHandler(async (req, res, next) => {
  logger.info("getAllMedia endpoint hit");
  const media = await Media.find();
  res.status(200).json({
    status: SUCCESS,
    data: {
      media,
    },
  });
});
export { uploadMedia, getAllMedia };
