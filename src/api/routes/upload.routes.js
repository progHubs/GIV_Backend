const express = require("express");
const router = express.Router();
const {
  uploadImage,
  upload,
  handleUploadError,
  processUpload,
  cleanupTempFiles,
  imageOptimizer,
  fileValidator,
  fileManager,
  uploadVideo,
  uploadDocument,
  uploadTracker,
} = require("../../middlewares/uploadMiddleware");
const { authenticateToken } = require("../../middlewares/auth.middleware");
const logger = require("../../utils/logger.util");
const {
  uploadImageController,
  uploadVideoController,
  uploadImagesController,
  uploadPdfController,
  uploadDocumentController,
  uploadMixedController,
  uploadWithProgressController,
  optimizeImageController,
  cleanupController,
  scanController,
  statsController,
  progressController,
} = require("../controllers/upload.controllers");

// ===== PUBLIC ROUTES =====

// Get upload statistics
router.get("/stats", statsController);

// Get upload progress
router.get("/progress/:uploadId", progressController);

// ===== PROTECTED ROUTES =====

// Single image upload
router.post(
  "/image",
  uploadImage.single("image"),
  handleUploadError,
  processUpload,
  cleanupTempFiles,
  uploadImageController
);

// Video upload
router.post(
  "/video",
  uploadVideo.single("video"),
  handleUploadError,
  processUpload,
  cleanupTempFiles,
  uploadVideoController
);

// Multiple images upload
router.post(
  "/images",
  uploadImage.array("images", 10),
  handleUploadError,
  processUpload,
  cleanupTempFiles,
  uploadImagesController
);

// PDF upload
router.post(
  "/pdf",
  uploadDocument.single("pdf"),
  handleUploadError,
  processUpload,
  cleanupTempFiles,
  uploadPdfController
);

// Document upload
router.post(
  "/document",
  uploadDocument.single("document"),
  handleUploadError,
  processUpload,
  cleanupTempFiles,
  uploadDocumentController
);

// Mixed file types upload
router.post(
  "/mixed",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "documents", maxCount: 3 },
    { name: "videos", maxCount: 2 },
  ]),
  handleUploadError,
  processUpload,
  cleanupTempFiles,
  uploadMixedController
);

// Upload with progress tracking
router.post(
  "/with-progress",
  upload.array("files", 5),
  handleUploadError,
  processUpload,
  cleanupTempFiles,
  uploadWithProgressController
);

// Optimize existing image
router.post("/optimize-image", optimizeImageController);

// Clean up old files
router.post("/cleanup", cleanupController);

// Virus scan simulation
router.post("/scan", scanController);

module.exports = router;
