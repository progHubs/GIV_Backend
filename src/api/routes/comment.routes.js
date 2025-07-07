const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controllers");
const {
  authenticateToken,
  optionalAuth,
  requireAdmin,
} = require("../../middlewares/auth.middleware");

// Get all comments for a post
router.get("/:post_id/comments", commentController.getCommentsByPost);

// Create a comment on a post (requires authentication)
router.post(
  "/:post_id/comments",
  authenticateToken,
  commentController.createComment
);

// Reply to a comment (requires authentication)
router.post(
  "/:post_id/comments/:parent_id/reply",
  authenticateToken,
  commentController.replyToComment
);

// Update a comment
router.put(
  "/comments/:comment_id",
  authenticateToken,
  commentController.updateComment
);

// Delete a comment (soft delete)
router.delete(
  "/comments/:comment_id",
  authenticateToken,
  commentController.deleteComment
);

// Approve or reject a comment (for admins/moderators)
router.post(
  "/comments/:comment_id/approve",
  authenticateToken,
  requireAdmin,
  commentController.approveComment
);

// Like or unlike a comment
router.post(
  "/comments/:comment_id/like",
  authenticateToken,
  commentController.toggleCommentLike
);

module.exports = router;
