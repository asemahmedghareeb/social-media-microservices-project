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
import postRoutes from "./routes/post-routes.js";
import connectDB from "./config/dbConfig.js";
import logger from "./utils/logger.js";
import { connectToRabbitMQ } from "./utils/rabbitmq.js";
dotenv.config();
connectDB();
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(redisRateLimiter);
app.use(endpointRateLimiter);
app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);
app.use(handleNotFoundResource);
app.use(globalErrorHandler);
async function startServer() {
  try {
    await connectToRabbitMQ(); 
    app.listen(process.env.PORT, () =>
      console.log(`Post Service is running on port ${process.env.PORT}`)
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
