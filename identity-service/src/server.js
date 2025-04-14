import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import endpointRateLimiter from "./middlewares/endpointRateLimiter.js";
import redisRateLimiter from "./middlewares/redisRateLimiter.js";
dotenv.config();
import identityRoutes from "./routes/identity-service.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import handleNotFoundResource from "./middlewares/notFoundResource.js";
import connectDB from "./config/dbConfig.js";
import logger from "./utils/logger.js";
dotenv.config();
connectDB();
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(redisRateLimiter);
app.use(endpointRateLimiter);
app.use("/api/auth", identityRoutes);
app.use(handleNotFoundResource);
app.use(globalErrorHandler);

app.listen(process.env.PORT, () =>
  console.log(`Identity Service is running on port ${process.env.PORT}`)
);

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});
