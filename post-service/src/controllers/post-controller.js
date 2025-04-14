import Post from "../models/Post.js";
import logger from "../utils/logger.js";
import appError from "../utils/appError.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { FAILED, SUCCESS } from "../utils/httpStatus.js";
import { publishEvent } from "../utils/rabbitmq.js";

const invalidatePostsCache = async (req, input) => {
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);

  const keys = await req.redisClient.keys("posts:*");
  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
};
const createPost = asyncHandler(async (req, res, next) => {
  logger.info("Creating post end point hit");
  const { content, mediaIds } = req.body;
  if (!content) {
    logger.error("Content is required");
    return next(appError.createError("Content is required", 400, FAILED));
  }
  const post = new Post({
    user: req.user.userId,
    content,
    mediaIds: mediaIds || [],
  });
  await post.save();
  await publishEvent("post.created", {
    postId: post._id.toString(),
    userId: req.user.userId.toString(),
    content: post.content,
    createdAt: post.createdAt,
  });
  await invalidatePostsCache(req, post._id.toString());

  if (!post) {
    logger.error("Failed to create post");
    return next(appError.createError("Failed to create post", 400, FAILED));
  }

  logger.info("Post created successfully", post._id);
  res.status(201).json({
    message: "Post created successfully",
    status: SUCCESS,
  });
});

const getAllPosts = asyncHandler(async (req, res, next) => {
  logger.info("Get all posts end point hit");
  const page = -req.query.page || 1;
  const limit = -req.query.limit || 5;
  const skip = (page - 1) * limit;
  const totalPosts = await Post.countDocuments();
  const totalPages = Math.ceil(totalPosts / limit);
  if (page < 1 || limit < 1) {
    logger.error("Invalid page or limit");
    return next(appError.createError("Invalid page or limit", 400, FAILED));
  }

  const cacheKey = `posts:${page}:${limit}`;
  const cachedPosts = await req.redisClient.get(cacheKey);
  if (cachedPosts) {
    logger.info("Posts retrieved from cache");
    return res.status(200).json({
      message: "Posts retrieved successfully",
      status: SUCCESS,
      data: { posts: JSON.parse(cachedPosts) },
    });
  }

  const posts = await Post.find().skip(skip).limit(limit);
  if (!posts) {
    logger.error("Failed to retrieve posts");
    return next(appError.createError("Failed to retrieve posts", 400, FAILED));
  }
  const result = { posts, currentPage: page, totalPosts, totalPages };
  await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

  logger.info("Posts retrieved successfully");
  res.status(200).json({
    message: "Posts retrieved successfully",
    status: SUCCESS,
    data: result,
  });
});

const getPost = asyncHandler(async (req, res, next) => {
  logger.info("Get post end point hit");
  const cacheKey = `post:${req.params.id}`;
  const cachedPost = await req.redisClient.get(cacheKey);
  if (cachedPost) {
    logger.info("Post retrieved from cache");
    return res.status(200).json({
      message: "Post retrieved successfully",
      status: SUCCESS,
      data: { post: JSON.parse(cachedPost) },
    });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    logger.error("Post not found");
    return next(appError.createError("Post not found", 404, FAILED));
  }
  await req.redisClient.setex(cacheKey, 3600, JSON.stringify(post));
  res.status(200).json({
    message: "Post retrieved successfully",
    status: SUCCESS,
    data: { post },
  });
  logger.info("Post retrieved successfully", post._id);
});

const updatePost = asyncHandler(async (req, res, next) => {
  logger.info("Update post end point hit");
  const { content, mediaIds } = req.body;
  invalidatePostsCache(req, req.params.id);
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { content, mediaIds },
    { new: true }
  );

  if (!post) {
    logger.error("Post not found");
    return next(appError.createError("Post not found", 404, FAILED));
  }
  res.status(200).json({
    message: "Post updated successfully",
    status: SUCCESS,
    data: { post },
  });
  logger.info("Post updated successfully", post._id);
});

const deletePost = asyncHandler(async (req, res, next) => {
  logger.info("Deleting post end point hit");

  const post = await Post.findByIdAndDelete({
    _id: req.params.id,
    user: req.user.userId,
  });
  if (!post) {
    logger.error("Post not found");
    return next(appError.createError("Post not found", 404, FAILED));
  }
  publishEvent("post.deleted", {
    postId: post.id.toString(),
    userId: req.user.userId,
    mediaIds: post.mediaIds,
  });
  await invalidatePostsCache(req, req.params.id);
  logger.info("Post deleted successfully", post._id);
  res.status(200).json({
    message: "Post deleted successfully",
    status: SUCCESS,
    data: { post },
  });
});

export { createPost, getPost, updatePost, deletePost, getAllPosts };
