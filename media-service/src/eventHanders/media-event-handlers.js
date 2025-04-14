import { deleteMediaFromCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/logger.js";
import Media from "../models/Media.js";
const handlePostDeleted = async (event) => {
  console.log(event, "event");
  const { postId, mediaIds } = event;
  try {
    const deletedMedia = await Media.find({ _id: { $in: mediaIds } });
    for (const media of deletedMedia) {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);
      logger.info(
        `Media with ID ${media._id} associated with post ${postId} deleted successfully.`
      );
    }
    logger.info("Media deleted successfully");
  } catch (error) {
    logger.error("Error deleting media:", error);
  }
};
 
export { handlePostDeleted };
 