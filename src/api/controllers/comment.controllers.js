const Comment = require("../../models/comment.models");

// Get all comments for a post with pagination
async function getCommentsByPost(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await Comment.findByPostId(req.params.post_id, options);

    res.json({
      success: true,
      data: result.comments,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create a comment on a post
async function createComment(req, res) {
  try {
    const { content } = req.body;
    if (!content)
      return res
        .status(400)
        .json({ success: false, error: "Content is required" });

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required to comment",
        code: "AUTH_REQUIRED"
      });
    }

    const comment = await Comment.create({
      postId: req.params.post_id,
      userId: req.user.id,
      content,
    });
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Reply to a comment
async function replyToComment(req, res) {
  try {
    const { content } = req.body;
    if (!content)
      return res
        .status(400)
        .json({ success: false, error: "Content is required" });

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required to reply",
        code: "AUTH_REQUIRED"
      });
    }

    const comment = await Comment.reply({
      postId: req.params.post_id,
      parentId: req.params.parent_id,
      userId: req.user.id,
      content,
    });
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update a comment
async function updateComment(req, res) {
  try {
    const { content } = req.body;
    if (!content)
      return res
        .status(400)
        .json({ success: false, error: "Content is required" });

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }

    const updated = await Comment.update(req.params.comment_id, req.user.id, {
      content,
    });
    if (!updated)
      return res.status(404).json({
        success: false,
        error: "Comment not found or not owned by user",
      });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Delete a comment (soft delete)
async function deleteComment(req, res) {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }

    const deleted = await Comment.softDelete(
      req.params.comment_id,
      req.user.id
    );
    if (!deleted)
      return res.status(404).json({
        success: false,
        error: "Comment not found or not owned by user",
      });
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Approve or reject a comment
async function approveComment(req, res) {
  try {
    const { is_approved } = req.body;
    if (typeof is_approved !== "boolean")
      return res
        .status(400)
        .json({ success: false, error: "is_approved (boolean) required" });
    const updated = await Comment.approve(req.params.comment_id, is_approved);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Like or unlike a comment
async function toggleCommentLike(req, res) {
  try {
    const updated = await Comment.toggleLike(req.params.comment_id);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getCommentsByPost,
  createComment,
  replyToComment,
  updateComment,
  deleteComment,
  approveComment,
  toggleCommentLike,
};
