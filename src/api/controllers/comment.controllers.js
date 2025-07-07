const Comment = require("../../models/comment.models");

// Get all comments for a post
async function getCommentsByPost(req, res) {
  try {
    const comments = await Comment.findByPostId(req.params.post_id);
    res.json({ success: true, data: comments });
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
    const comment = await Comment.create({
      postId: req.params.post_id,
      userId: 0, //req.user.id,
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
    const comment = await Comment.reply({
      postId: req.params.post_id,
      parentId: req.params.parent_id,
      userId: 0, //req.user.id,
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
    const updated = await Comment.update(req.params.comment_id, 0, {
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
    const deleted = await Comment.softDelete(
      req.params.comment_id,
      0 //req.user.id
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
