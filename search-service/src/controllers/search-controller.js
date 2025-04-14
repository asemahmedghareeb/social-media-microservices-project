import { asyncHandler } from "../middlewares/errorHandler.js";
import Search from "../models/search.js";
import { SUCCESS } from "../utils/httpStatus.js";
import logger from "../utils/logger.js";
const searchPostController = asyncHandler(async (req, res) => {
  logger.info("search endpoint hit");
  const { query } = req.query;
  const results = await Search.find(
    {
      $text: { $search: query },
    },
    {
      score: { $meta: "textScore" },
    }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(10);

  res.status(200).json({
    status: SUCCESS,
    data: results,
  });
});
export { searchPostController }; 