import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import logger from "../utils/logger.js";
import { ERROR } from "../utils/httpStatus.js";
const redisClient = new Redis(process.env.REDIS_URL);
const redisRateLimit = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware", 
  points: 10,
  duration: 1,
});

const redisRateLimiter = async (req, res, next) => {
    try { 
      await redisRateLimit.consume(req.ip);
      next();
    } catch (error) {
      logger.warn(`Too many requests from IP: ${req.ip}`);
      res.status(429).json({
        status: ERROR,
        message: "Too many requests",
      });
    }
};  

export { redisRateLimiter, redisClient };