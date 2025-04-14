import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import endpointRateLimiter from "./middlewares/endpointRateLimiter.js";
import {
  redisRateLimiter,
  redisClient,
} from "./middlewares/redisRateLimiter.js";
dotenv.config();
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import handleNotFoundResource from "./middlewares/notFoundResource.js";
import connectDB from "./config/dbConfig.js";
import logger from "./utils/logger.js";
import searchRoutes from "./routes/search-routes.js";
import { connectToRabbitMQ, consumeEvent } from "./utils/rabbitmq.js";
import {
  handlePostCreatedEvent,
  handlePostDeletedEvent,
} from "./eventHandlers/search-event-handler.js";
dotenv.config();
connectDB();
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(redisRateLimiter);
app.use(endpointRateLimiter);
app.use(
  "/api/search",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  searchRoutes
);
app.use(handleNotFoundResource);
app.use(globalErrorHandler);
async function startServer() {
  try {
    await connectToRabbitMQ();
    await consumeEvent("post.created", handlePostCreatedEvent);
    await consumeEvent("post.deleted", handlePostDeletedEvent);
    app.listen(process.env.PORT, () =>
      console.log(`Post search is running on port ${process.env.PORT}`)
    );
  } catch (error) {
    logger.error("Error connecting to server", error);
    process.exit(1);
  }
}
startServer();
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});
