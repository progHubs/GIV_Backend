const express = require("express");
const router = express.Router();
const { uploadImage } = require("../../middlewares/uploadMiddleware");
const {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireUser,
  optionalAuth,
} = require("../../middlewares/auth.middleware");
const {
  checkPostOwnership,
  checkPostCreationPermission,
  addUserContext,
  rateLimitPostCreation,
} = require("../../middlewares/post.middleware");
const {
  checkPostStatus,
  createPost,
  getPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  searchPosts,
  queryPosts,
} = require("../controllers/post.controllers");

// ===== PUBLIC ROUTES (No authentication required) =====
// These routes are accessible to everyone, but can include user context if authenticated

// Get all posts with pagination and filtering
router.get("/", optionalAuth, addUserContext, getPosts);

// Check database status for post creation
router.get("/status", checkPostStatus);

// Search posts by content
router.get("/search", optionalAuth, addUserContext, searchPosts);

// Advanced query posts with multiple filters
router.get("/query", optionalAuth, addUserContext, queryPosts);

// Get post by ID
router.get("/id/:id", optionalAuth, addUserContext, getPostById);

// Get post by slug
router.get("/slug/:slug", optionalAuth, addUserContext, getPostBySlug);

// ===== PROTECTED ROUTES (Authentication required) =====

// Create new post (requires authentication + specific roles + rate limiting)
router.post(
  "/",
  authenticateToken,
  checkPostCreationPermission,
  rateLimitPostCreation,
  uploadImage.single("feature_image"),
  createPost
);

// Update post (requires authentication + ownership or admin/editor role)
router.put(
  "/:id",
  authenticateToken,
  checkPostOwnership, // This middleware checks ownership and permissions
  uploadImage.single("feature_image"),
  updatePost
);

// Delete post (requires authentication + admin role only)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin, // Only admins can delete posts
  deletePost
);

module.exports = router;
