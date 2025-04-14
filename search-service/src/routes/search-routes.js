import express from "express";
const router = express.Router();
import { searchPostController } from "../controllers/search-controller.js";
import { authenticateRequest } from "../middlewares/authMiddleware.js";
router.use(authenticateRequest);
router.get("/posts", searchPostController);

export default router;
