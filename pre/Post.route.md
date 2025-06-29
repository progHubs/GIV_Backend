const express = require("express");
const router = express.Router();
const {
  uploadImage,
  uploadVideo,
  handleUploadError,
} = require("../../middlewares/uploadMiddleware");
const { authenticateToken } = require("../../middlewares/auth.middleware");
const postController = require("../controllers/post.controllers");

// Public routes
router.get("/posts", postController.getAllPosts);
router.get("/posts/featured", postController.getFeaturedPosts);
router.get("/posts/category/:categoryId", postController.getPostsByCategory);
router.get("/posts/search", postController.searchPosts);
router.get("/posts/:id", postController.getPostById);
router.get("/posts/slug/:slug", postController.getPostBySlug);

// Protected routes (require authentication)
router.use(authenticateToken);

// Post CRUD operations
router.post(
  "/posts",
  uploadImage.single("thumbnail"),
  handleUploadError,
  postController.createPost
);

router.put(
  "/posts/:id",
  uploadImage.single("thumbnail"),
  handleUploadError,
  postController.updatePost
);
router.delete("/posts/:id", postController.deletePost);

// Post media management
router.post(
  "/posts/:id/media",
  uploadImage.fields([
    { name: "images", maxCount: 10 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  handleUploadError,
  postController.addPostMedia
);

router.post(
  "/posts/:id/video",
  uploadVideo.single("video"),
  handleUploadError,
  postController.addPostVideo
);

router.delete("/posts/:id/media/:mediaId", postController.deletePostMedia);

// Post engagement
router.post("/posts/:id/like", postController.likePost);
router.post("/posts/:id/unlike", postController.unlikePost);
router.post("/posts/:id/share", postController.sharePost);

// Post comments
router.get("/posts/:id/comments", postController.getPostComments);
router.post("/posts/:id/comments", postController.addComment);
router.put("/posts/:id/comments/:commentId", postController.updateComment);
router.delete("/posts/:id/comments/:commentId", postController.deleteComment);

// Post status management
router.put("/posts/:id/publish", postController.publishPost);
router.put("/posts/:id/unpublish", postController.unpublishPost);
router.put("/posts/:id/feature", postController.featurePost);
router.put("/posts/:id/unfeature", postController.unfeaturePost);

// Post categories and tags
router.get("/posts/categories", postController.getCategories);
router.get("/posts/tags", postController.getTags);
router.post("/posts/:id/categories", postController.addCategories);
router.post("/posts/:id/tags", postController.addTags);
router.delete(
  "/posts/:id/categories/:categoryId",
  postController.removeCategory
);
router.delete("/posts/:id/tags/:tagId", postController.removeTag);

module.exports = router;
