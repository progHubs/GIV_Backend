const Post = require("../../models/post.model");
const {
  validatePostData,
  validatePostUpdateData,
} = require("../../utils/post.validations.utils");
const { uploadToCloudinary } = require("../../config/cloudinary.config");
const logger = require("../../utils/logger.util");
const prisma = require("../../config/prisma");

/**
 * Check database status for post creation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkPostStatus = async (req, res) => {
  try {
    const userCount = await prisma.users.count();
    const adminUser = await prisma.users.findFirst({
      where: { role: "admin" },
    });

    res.json({
      success: true,
      data: {
        hasUsers: userCount > 0,
        userCount,
        hasAdminUser: !!adminUser,
        canCreatePosts: userCount > 0,
        message:
          userCount === 0
            ? "No users found. Run 'npm run db:seed' to populate the database."
            : "Database is ready for post creation.",
      },
    });
  } catch (error) {
    logger.error("Error checking post status:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

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

    // Normalize is_featured to boolean
    if (typeof postData.is_featured === "string") {
      postData.is_featured = postData.is_featured === "true";
    } else {
      postData.is_featured = false;
    }

    // Normalize tags: trim, remove empty, join as comma-separated string, or set to null
    if (typeof postData.tags === "string") {
      const tagsArr = postData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      postData.tags = tagsArr.length > 0 ? tagsArr.join(",") : null;
    } else {
      postData.tags = null;
    }

    // Validate post data
    const validation = validatePostData(postData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    // Set the authenticated user as the author
    const authorId = 5; // req.user.id;
    validation.sanitized.author_id = authorId;

    // Create post
    const post = await Post.create(validation.sanitized);

    res.status(201).json({
      success: true,
      data: post,
      message: "Post created successfully",
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
    const currentUser = req.user;

    // Check if post exists before attempting to update
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      logger.warn(`Post with ID ${postId} not found for update`);
      return res.status(404).json({
        success: false,
        error: `Post with ID ${postId} not found`,
      });
    }

    // Authorization is handled by checkPostOwnership middleware
    // The post is already available in req.post from the middleware

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
    const postId = req.params.id;
    const currentUser = req.user;

    // Check if post exists before attempting to delete
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      logger.warn(`Post with ID ${postId} not found for deletion`);
      return res.status(404).json({
        success: false,
        error: `Post with ID ${postId} not found`,
      });
    }

    // Authorization is handled by requireAdmin middleware
    // Only admins can reach this point

    // Delete post
    await Post.delete(postId);

    res.json({
      success: true,
      message: "Post deleted successfully",
      deletedPost: {
        id: existingPost.id,
        title: existingPost.title,
        deletedBy: currentUser.id,
        deletedAt: new Date().toISOString(),
      },
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

// Get all featured posts
async function getFeaturedPosts(req, res) {
  try {
    const posts = await Post.getFeatured();
    res.json({ success: true, data: posts });
  } catch (error) {
    logger.error("Error fetching featured posts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get posts by author
async function getPostsByAuthor(req, res) {
  try {
    const posts = await Post.getByAuthor(req.params.user_id);
    res.json({ success: true, data: posts });
  } catch (error) {
    logger.error("Error fetching posts by author:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get posts by tag
async function getPostsByTag(req, res) {
  try {
    const posts = await Post.getByTag(req.params.tag.toLowerCase());
    res.json({ success: true, data: posts });
  } catch (error) {
    logger.error("Error fetching posts by tag:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get posts by type
async function getPostsByType(req, res) {
  try {
    const posts = await Post.getByType(req.params.type);
    res.json({ success: true, data: posts });
  } catch (error) {
    if (error.message === "Invalid post type") {
      return res.status(400).json({ success: false, error: error.message });
    }
    logger.error("Error fetching posts by type:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get related posts (by tags)
async function getRelatedPosts(req, res) {
  try {
    const related = await Post.getRelated(req.params.id);
    res.json({ success: true, data: related });
  } catch (error) {
    logger.error("Error fetching related posts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Increment post views
async function incrementPostView(req, res) {
  try {
    const post = await Post.incrementViews(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    res.json({ success: true, data: post });
  } catch (error) {
    logger.error("Error incrementing post views:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Like or unlike post (toggle)
async function togglePostLike(req, res) {
  try {
    const post = await Post.toggleLike(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    res.json({ success: true, data: post });
  } catch (error) {
    logger.error("Error toggling post like:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  checkPostStatus,
  createPost,
  getPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  searchPosts,
  queryPosts,
  getFeaturedPosts,
  getPostsByAuthor,
  getPostsByTag,
  getPostsByType,
  getRelatedPosts,
  incrementPostView,
  togglePostLike,
};
