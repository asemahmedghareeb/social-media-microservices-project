import express from "express";
import authenticateRequest from "../middlewares/authMiddleware.js";
import {
  createPost,
  deletePost,
  getPost,
  getAllPosts,
  updatePost,
} from "../controllers/post-controller.js";
import { postValidation } from "../utils/validation.js";

const router = express.Router();
router.use(authenticateRequest);
router.post("/create-post", postValidation, createPost);
router.get("/get-all-posts", getAllPosts);
router.route("/:id").get(getPost).put(updatePost).delete(deletePost);
export default router;
