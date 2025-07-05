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

/**
 * Advanced query posts with multiple filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const queryPosts = async (req, res) => {
  try {
    console.log("=== QUERY POSTS CONTROLLER START ===");
    console.log("Request query:", JSON.stringify(req.query, null, 2));

    const {
      // Pagination
      page = 1,
      limit = 10,

      // Basic filters
      post_type,
      language,

      // Text search
      title_search,
      content_search,
      slug_search,

      // Date filters
      created_after,
      created_before,
      updated_after,
      updated_before,

      // Author filters
      author_id,
      author_name,

      // Sort options
      sort_by = "created_at",
      sort_order = "desc",

      // Advanced filters
      has_image,
      content_length_min,
      content_length_max,

      // Multiple values
      post_types,
      languages,
      author_ids,
    } = req.query;

    console.log("Extracted query parameters:", {
      page,
      limit,
      post_type,
      language,
      title_search,
      content_search,
      slug_search,
      created_after,
      created_before,
      updated_after,
      updated_before,
      author_id,
      author_name,
      sort_by,
      sort_order,
      has_image,
      content_length_min,
      content_length_max,
      post_types,
      languages,
      author_ids,
    });

    // Build query options
    const queryOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      post_type,
      language,
      title_search,
      content_search,
      slug_search,
      created_after,
      created_before,
      updated_after,
      updated_before,
      author_id,
      author_name,
      sort_by,
      sort_order,
      has_image: has_image === "true",
      content_length_min: content_length_min
        ? parseInt(content_length_min)
        : null,
      content_length_max: content_length_max
        ? parseInt(content_length_max)
        : null,
      post_types: post_types ? post_types.split(",") : null,
      languages: languages ? languages.split(",") : null,
      author_ids: author_ids
        ? author_ids.split(",").map((id) => parseInt(id))
        : null,
    };

    console.log(
      "Query options being passed to model:",
      JSON.stringify(queryOptions, null, 2)
    );

    const result = await Post.query(queryOptions);

    console.log("Result from model:", {
      postsCount: result.posts?.length || 0,
      pagination: result.pagination,
    });

    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
      filters: {
        applied: Object.keys(req.query).filter(
          (key) => req.query[key] !== undefined && req.query[key] !== ""
        ),
        total: Object.keys(req.query).length,
      },
    });

    console.log("=== QUERY POSTS CONTROLLER END ===");
  } catch (error) {
    console.error("=== QUERY POSTS CONTROLLER ERROR ===");
    console.error("Error in queryPosts controller:", error);
    console.error("=== QUERY POSTS CONTROLLER ERROR END ===");

    logger.error("Error querying posts:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
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
  queryPosts,
};
