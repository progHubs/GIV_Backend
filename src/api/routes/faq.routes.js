const express = require("express");
const router = express.Router();
// const { authenticateToken } = require('../../middlewares/auth.middleware');
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
router.get("/category/:category", getFAQsByCategory);
router.get("/id/:id", getFAQById);

// Protected routes (authentication required)
router.post("/", createFAQ);

router.put("/:id", updateFAQ);

router.delete("/:id", deleteFAQ);

router.put("/sort/bulk", updateFAQSortOrder);

router.patch("/:id/toggle-visibility", toggleFAQVisibility);
router.get("/recent", getRecentFAQs);

module.exports = router;
