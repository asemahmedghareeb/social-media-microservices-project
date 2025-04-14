import logger from "../utils/logger.js";
import { ERROR } from "../utils/httpStatus.js";
import proxy from "express-http-proxy";
import dotenv from "dotenv";
dotenv.config();
const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, req, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      status: ERROR,
      message: "Internal Server Error",
    });
  },
};

const identityProxyServer = proxy(process.env.IDENTITY_SERVICE_URL, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(
      `Response received from Identity service: ${proxyRes.statusCode}`
    );
    return proxyResData;
  },
});

const postProxyServer = proxy(process.env.POST_SERVICE_URL, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response received from Posts service: ${proxyRes.statusCode}`);
    return proxyResData;
  },
});

const mediaProxyServer = proxy(process.env.MEDIA_SERVICE_URL, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

    if (!srcReq.headers["content-type"].startsWith("multipart/form-data")) {
      proxyReqOpts.headers["Content-Type"] = "application/json";
    }

    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response received from Media service: ${proxyRes.statusCode}`);
    return proxyResData;
  },
  parseReqBody: false,
});
const SearchProxyServer = proxy(process.env.SEARCH_SERVICE_URL, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
   
    proxyReqOpts.headers["Content-Type"] = "application/json";
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(
      `Response received from search service: ${proxyRes.statusCode}`
    );
    return proxyResData;
  },
  parseReqBody: false,
});

export {
  identityProxyServer,
  postProxyServer,
  mediaProxyServer,
  SearchProxyServer,
};
