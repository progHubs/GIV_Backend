const FAQ = require("../../models/faq.model");
const logger = require("../../utils/logger.util");
const { validateFAQ } = require("../../utils/faq.validations.utils");

/**
 * Create a new FAQ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createFAQ = async (req, res) => {
  try {
    const validation = validateFAQ(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: validation.errors,
      });
    }

    const faq = await FAQ.create(validation.sanitized);

    res.status(201).json({
      success: true,
      data: faq,
      message: "FAQ created successfully",
    });
  } catch (error) {
    logger.error("Error creating FAQ:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        error: "Duplicate entry",
        details: "A FAQ with similar content already exists",
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
 * Get all FAQs with optional filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFAQs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      language,
      is_active,
      sort_by = "sort_order",
      sort_order = "asc",
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      language,
      is_active:
        is_active === "true" ? true : is_active === "false" ? false : undefined,
      sort_by,
      sort_order,
    };

    const result = await FAQ.getAll(options);

    res.json({
      success: true,
      data: result.faqs,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Error getting FAQs:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

/**
 * Get FAQ by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.getById(req.params.id);

    res.json({
      success: true,
      data: faq,
    });
  } catch (error) {
    logger.error("Error getting FAQ by ID:", error);

    if (error.message === "FAQ not found") {
      return res.status(404).json({
        success: false,
        error: "FAQ not found",
        details: "The requested FAQ does not exist",
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
 * Update FAQ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateFAQ = async (req, res) => {
  try {
    const validation = validateFAQ(req.body, true);

    if (!validation.isValid) {
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

    const updatedFAQ = await FAQ.update(req.params.id, validation.sanitized);

    res.json({
      success: true,
      data: updatedFAQ,
      message: "FAQ updated successfully",
    });
  } catch (error) {
    logger.error("Error updating FAQ:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "FAQ not found",
        details: "The FAQ you're trying to update doesn't exist",
      });
    }

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        error: "Duplicate entry",
        details: "A FAQ with similar content already exists",
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
 * Delete FAQ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteFAQ = async (req, res) => {
  try {
    await FAQ.delete(req.params.id);

    res.json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting FAQ:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "FAQ not found",
        details: "The FAQ you're trying to delete doesn't exist",
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
 * Search FAQs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchFAQs = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Search query required",
        details: "Please provide a search term",
      });
    }

    const { page = 1, limit = 10, category, language, is_active } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      language,
      is_active:
        is_active === "true" ? true : is_active === "false" ? false : undefined,
    };

    const result = await FAQ.search(q.trim(), options);

    res.json({
      success: true,
      data: result.faqs,
      pagination: result.pagination,
      query: q.trim(),
    });
  } catch (error) {
    logger.error("Error searching FAQs:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

/**
 * Get FAQs by category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFAQsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category || category.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Category required",
        details: "Please provide a category name",
      });
    }

    const {
      page = 1,
      limit = 10,
      language,
      is_active = true,
      sort_by = "sort_order",
      sort_order = "asc",
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      language,
      is_active:
        is_active === "true" ? true : is_active === "false" ? false : true,
      sort_by,
      sort_order,
    };

    const result = await FAQ.getByCategory(category.trim(), options);

    res.json({
      success: true,
      data: result.faqs,
      pagination: result.pagination,
      category: category.trim(),
    });
  } catch (error) {
    logger.error("Error getting FAQs by category:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

/**
 * Get all FAQ categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFAQCategories = async (req, res) => {
  try {
    const categories = await FAQ.getCategories();

    res.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    logger.error("Error getting FAQ categories:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

/**
 * Update FAQ sort order (bulk)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateFAQSortOrder = async (req, res) => {
  try {
    const { sortData } = req.body;

    if (!Array.isArray(sortData) || sortData.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid sort data",
        details: "Please provide an array of FAQ IDs and sort orders",
      });
    }

    // Validate sort data structure
    const isValidSortData = sortData.every(
      (item) =>
        item.id && item.sort_order !== undefined && item.sort_order !== null
    );

    if (!isValidSortData) {
      return res.status(400).json({
        success: false,
        error: "Invalid sort data structure",
        details: "Each item must have 'id' and 'sort_order' properties",
      });
    }

    await FAQ.updateSortOrder(sortData);

    res.json({
      success: true,
      message: "FAQ sort order updated successfully",
      updated: sortData.length,
    });
  } catch (error) {
    logger.error("Error updating FAQ sort order:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

/**
 * Toggle FAQ visibility (is_active)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const toggleFAQVisibility = async (req, res) => {
  try {
    const id = req.params.id;
    // Get current FAQ
    const faq = await FAQ.getById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: "FAQ not found",
      });
    }
    // Toggle is_active
    const updatedFAQ = await FAQ.update(id, { is_active: !faq.is_active });
    res.json({
      success: true,
      data: updatedFAQ,
      message: `FAQ is now ${updatedFAQ.is_active ? "active" : "inactive"}`,
    });
  } catch (error) {
    logger.error("Error toggling FAQ visibility:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

/**
 * Get recent FAQs (latest 5)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRecentFAQs = async (req, res) => {
  try {
    let limit = 5;
    if (req.query.limit !== undefined) {
      const parsed = parseInt(req.query.limit, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 50); // Cap at 50 for safety
      }
    }
    const faqs = await FAQ.getRecent(limit);
    res.json({
      success: true,
      data: faqs,
      count: faqs.length,
    });
  } catch (error) {
    logger.error("Error getting recent FAQs:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

module.exports = {
  createFAQ,
  getFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
  searchFAQs,
  getFAQsByCategory,
  getFAQCategories,
  updateFAQSortOrder,
  toggleFAQVisibility,
  getRecentFAQs,
};
