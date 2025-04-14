import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import endpointRateLimiter from "./middlewares/endpointRateLimiter.js";
import { redisRateLimiter } from "./middlewares/redisRateLimiter.js";
dotenv.config();
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import handleNotFoundResource from "./middlewares/notFoundResource.js";
import connectDB from "./config/dbConfig.js";
import logger from "./utils/logger.js";
import mediaRoutes from "./routes/media-route.js";
import { connectToRabbitMQ, consumeEvent } from "./utils/rabbitmq.js";
import { handlePostDeleted } from "./eventHanders/media-event-handlers.js";
dotenv.config();
connectDB();
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(redisRateLimiter);
app.use(endpointRateLimiter);

app.use("/api/media", mediaRoutes);
app.use(handleNotFoundResource);
app.use(globalErrorHandler);
async function startServer(params) {
  try {
    await connectToRabbitMQ();
    await consumeEvent("post.deleted", handlePostDeleted);
    app.listen(process.env.PORT, () => {
      logger.info(`media Service is running on port ${process.env.PORT}`);
    });
  } catch (err) {
    logger.error("Error starting the server:", err);
    console.log(err);
  }
}
startServer();
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});
