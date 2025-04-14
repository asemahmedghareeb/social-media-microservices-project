import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";
import logger from "../utils/logger.js";
import { ERROR } from "../utils/httpStatus.js";
const redisClient = new Redis(process.env.REDIS_URL);
const EndpointRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Too many requests from IP: ${req.ip}`);
    res.status(429).json({
      status: ERROR,
      message: "Too many requests",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

export default EndpointRateLimiter;
