import cloudinary from "cloudinary";
import logger from "./logger.js";
import dotenv from "dotenv";
dotenv.config();
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMediaToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          logger.error("Error while uploading media to cloudinary", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(file.buffer);
  });
};

const deleteMediaFromCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(public_id);
    logger.info("Media deleted from cloudinary");
    return result;
  } catch (error) {
    logger.error("Error while deleting media from cloudinary", error);
    throw error;
  }
};
export { uploadMediaToCloudinary, deleteMediaFromCloudinary };
