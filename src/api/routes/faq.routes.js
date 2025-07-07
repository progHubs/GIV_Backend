const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../../middlewares/auth.middleware');
const {
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
} = require("../controllers/faq.controllers");

// Public routes (no authentication required)
router.get("/", getFAQs);
router.get("/search", searchFAQs);
router.get("/categories", getFAQCategories);
router.get("/recent", getRecentFAQs);
router.get("/category/:category", getFAQsByCategory);
router.get("/id/:id", getFAQById);

// Protected routes (authentication required)
router.post("/", authenticateToken, requireAdmin, createFAQ);

router.put("/:id", authenticateToken, requireAdmin, updateFAQ);

router.delete("/:id", authenticateToken, requireAdmin, deleteFAQ);

router.put("/sort/bulk", authenticateToken, requireAdmin, updateFAQSortOrder);

router.patch("/:id/toggle-visibility", authenticateToken, requireAdmin, toggleFAQVisibility);

module.exports = router;
