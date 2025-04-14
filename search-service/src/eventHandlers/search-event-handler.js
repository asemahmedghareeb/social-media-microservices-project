import logger from "../utils/logger.js";
import Search from "../models/search.js";
async function handlePostCreatedEvent(event) {
  try {
    const newSearchPost = new Search({
      postId: event.postId,
      userId: event.userId,
      content: event.content,
      createdAt: event.createdAt,
    });
    await newSearchPost.save();
    logger.info(
      `search post created :post id =${
        event.postId
      },search post id = ${newSearchPost._id.toString()}`
    );
  } catch (error) {
    logger.info("Error handling post created event", error);
  }
}
async function handlePostDeletedEvent(event) {
  try {
    await Search.deleteOne({ postId: event.postId });
    logger.info(
      `search post deleted :post id =${event.postId}`
    );
  } catch (error) {
    logger.info("Error handling post deletion event", error);
  }
}
export { handlePostCreatedEvent, handlePostDeletedEvent };
