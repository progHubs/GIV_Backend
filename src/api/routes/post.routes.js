const express = require("express");
const router = express.Router();
const { uploadImage } = require("../../middlewares/uploadMiddleware");
// const { authenticateToken } = require("../../middlewares/auth.middleware");
const {
  createPost,
  getPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  searchPosts,
} = require("../controllers/post.controllers");

// Public routes
router.get("/", getPosts);
router.get("/search", searchPosts);
router.get("/id/:id", getPostById);
router.get("/slug/:slug", getPostBySlug);

// Protected routes
router.post(
  "/",
  // authenticateToken,
  uploadImage.single("feature_image"),
  createPost
);
router.put(
  "/:id",
  // authenticateToken,
  uploadImage.single("feature_image"),
  updatePost
);
router.delete("/:id", deletePost);

module.exports = router;
