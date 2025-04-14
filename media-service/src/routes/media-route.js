import express from "express";
import multer from "multer";
import { getAllMedia, uploadMedia } from "../controllers/media-controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import logger from "../utils/logger.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 5 },
}).single("file");

router.post(
  "/upload",
  authMiddleware,
  (req, res, next) => {
    upload(req, res, function (err) {
      logger.info("Upload middleware called");
      if (err instanceof multer.MulterError) {
        logger.error("Multer error while uploading:", err);
        return res.status(400).json({
          message: "Multer error while uploading:",
          error: err.message,
          stack: err.stack,
        });
      } else if (err) {
        logger.error("Unknown error occured while uploading:", err);
        return res.status(500).json({
          message: "Unknown error occured while uploading:",
          error: err.message,
          stack: err.stack,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No file found!",
        });
      }
      logger.info("passed the upload middleware");
      next();
    });
  },
  uploadMedia
);

router.get("/get", authMiddleware, getAllMedia);
export default router; 
