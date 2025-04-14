import { ERROR } from "../utils/httpStatus.js";
function asyncHandler(fn) {
  return async (req, res, next) => {
    fn(req, res, next).catch((error) => {
      next(error);
    });
  };
}

const globalErrorHandler = (error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || ERROR,
    // message: error.message,
    message:error.statusText === undefined ? "some thing went wrong" : error.message,
    code: error.statusCode || 500,
    data: null,
  });
};

export { asyncHandler, globalErrorHandler };
