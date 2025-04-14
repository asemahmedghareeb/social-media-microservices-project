import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import EndpointRateLimiter from "./middlewares/endpointRateLimiter.js";
import redisRateLimiter from "./middlewares/redisRateLimiter.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import handleNotFoundResource from "./middlewares/notFoundResource.js";
import logger from "./utils/logger.js";
import {
  identityProxyServer,
  postProxyServer,
  mediaProxyServer,
  SearchProxyServer,
} from "./config/proxyConfig.js";
import { validateToken } from "./middlewares/authMiddleware.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(redisRateLimiter);
app.use(EndpointRateLimiter);
app.use(globalErrorHandler);
app.use("/v1/auth", identityProxyServer);
app.use("/v1/posts", validateToken, postProxyServer);
app.use("/v1/media", validateToken, mediaProxyServer);
app.use("/v1/search", validateToken, SearchProxyServer);
app.use(handleNotFoundResource);

app.listen(process.env.PORT, () => {
  logger.info(`API Gateway is running on port ${process.env.PORT}`);
  logger.info(
    `Identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`
  );
  logger.info(
    `Post service is running on port ${process.env.POST_SERVICE_URL}`
  );
  logger.info(
    `Media service is running on port ${process.env.MEDIA_SERVICE_URL}`
  );
  logger.info(
    `Search service is running on port ${process.env.SEARCH_SERVICE_URL}`
  );
  logger.info(`Redis url: ${process.env.REDIS_URL}`);
});

