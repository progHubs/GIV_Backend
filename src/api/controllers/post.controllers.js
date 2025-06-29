const Post = require("../../models/post.model");
const {
  validatePostData,
  validatePostUpdateData,
} = require("../../utils/post.validations.utils");
const { uploadToCloudinary } = require("../../config/cloudinary.config");
const logger = require("../../utils/logger.util");
const prisma = require("../../config/prisma");

/**
 * Create a new post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPost = async (req, res) => {
  try {
    let postData = req.body;

    // Handle image upload if present
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path);
        postData.feature_image = result.secure_url;
      } catch (error) {
        logger.error("Error uploading image to Cloudinary:", error);
        return res.status(500).json({
          success: false,
          error: "Error uploading image",
        });
      }
    }

    // Validate post data
    const validation = validatePostData(postData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    // Find admin user
    const adminUser = await prisma.users.findFirst({
      where: { role: "admin" },
    });

    if (!adminUser) {
      return res.status(500).json({
        success: false,
        error: "No admin user found in the system",
      });
    }

    // Add author information - using admin user for testing
    validation.sanitized.author_id = "60";

    // Create post
    const post = await Post.create(validation.sanitized);

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    logger.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all posts with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, post_type, language } = req.query;

    const result = await Post.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      post_type,
      language,
    });

    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Error fetching posts:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get a single post by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    logger.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get a single post by slug
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findBySlug(req.params.slug);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    logger.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    let postData = req.body;

    // Check if post exists before attempting to update
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      logger.warn(`Post with ID ${postId} not found for update`);
      return res.status(404).json({
        success: false,
        error: `Post with ID ${postId} not found`,
      });
    }

    // Handle image upload if present
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path);
        postData.feature_image = result.secure_url;
      } catch (error) {
        logger.error("Error uploading image to Cloudinary:", error);
        return res.status(500).json({
          success: false,
          error: "Error uploading image",
          details: error.message,
        });
      }
    }

    // Validate update data
    const validation = validatePostUpdateData(postData);
    if (!validation.isValid) {
      logger.warn(`Validation failed for post ${postId}:`, validation.errors);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: validation.errors,
      });
    }

    // Check if there's any data to update
    if (Object.keys(validation.sanitized).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid data provided for update",
        message: "Please provide at least one field to update",
      });
    }

    // Update post
    const updatedPost = await Post.update(postId, validation.sanitized);

    res.json({
      success: true,
      data: updatedPost,
      message: "Post updated successfully",
    });
  } catch (error) {
    logger.error("Error updating post:", error);

    // Check for specific Prisma errors
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Post not found",
        details: "The post you're trying to update doesn't exist",
      });
    }

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        error: "Duplicate entry",
        details: "A post with this slug already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

/**
 * Delete a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePost = async (req, res) => {
  try {
    await Post.delete(req.params.id);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting post:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Search posts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchPosts = async (req, res) => {
  try {
    const posts = await Post.search(req.query.q);

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    logger.error("Error searching posts:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  searchPosts,
};
