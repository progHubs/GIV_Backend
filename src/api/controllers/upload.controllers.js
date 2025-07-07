const logger = require("../../utils/logger.util");
const {
  imageOptimizer,
  fileValidator,
  fileManager,
  uploadTracker,
} = require("../../middlewares/uploadMiddleware");

// Single image upload
async function uploadImageController(req, res) {
  try {
    const file = req.processedFile;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, error: "No image uploaded" });
    }
    const fileForValidation = {
      originalname: file.originalName,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    };
    const validation = fileValidator.validateIntegrity(fileForValidation);
    if (!validation.isValid) {
      return res
        .status(400)
        .json({
          success: false,
          error: "File validation failed",
          issues: validation.issues,
        });
    }
    res.json({
      success: true,
      data: {
        originalName: file.originalName,
        filename: file.filename,
        url: file.url,
        cloudinaryId: file.cloudinaryId,
        size: file.size,
        mimetype: file.mimetype,
        validation,
      },
    });
  } catch (error) {
    logger.error("Error uploading image:", error);
    res.status(500).json({ success: false, error: "Failed to upload image" });
  }
}

// Video upload
async function uploadVideoController(req, res) {
  try {
    const file = req.processedFile;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, error: "No video uploaded" });
    }
    res.json({ success: true, data: file });
  } catch (error) {
    logger.error("Error uploading video:", error);
    res.status(500).json({ success: false, error: "Failed to upload video" });
  }
}

// Multiple images upload
async function uploadImagesController(req, res) {
  try {
    const files = req.processedFiles;
    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No images uploaded" });
    }
    const results = [];
    for (const file of files) {
      const fileForValidation = {
        originalname: file.originalName,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      };
      const validation = fileValidator.validateIntegrity(fileForValidation);
      let responsiveImages = null;
      if (file.cloudinaryId) {
        try {
          responsiveImages = await imageOptimizer.generateResponsiveImages(
            file.cloudinaryId
          );
        } catch (error) {
          logger.error("Error generating responsive images:", error);
        }
      }
      results.push({
        originalName: file.originalName,
        filename: file.filename,
        url: file.url,
        cloudinaryId: file.cloudinaryId,
        size: file.size,
        mimetype: file.mimetype,
        validation,
        responsiveImages,
      });
    }
    res.json({
      success: true,
      data: {
        files: results,
        totalFiles: results.length,
        totalSize: results.reduce((sum, f) => sum + f.size, 0),
      },
    });
  } catch (error) {
    logger.error("Error uploading images:", error);
    res.status(500).json({ success: false, error: "Failed to upload images" });
  }
}

// PDF upload
async function uploadPdfController(req, res) {
  try {
    const file = req.processedFile;
    if (!file) {
      return res.status(400).json({ success: false, error: "No PDF uploaded" });
    }
    res.json({ success: true, data: file });
  } catch (error) {
    logger.error("Error uploading PDF:", error);
    res.status(500).json({ success: false, error: "Failed to upload PDF" });
  }
}

// Document upload
async function uploadDocumentController(req, res) {
  try {
    const file = req.processedFile;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, error: "No document uploaded" });
    }
    res.json({ success: true, data: file });
  } catch (error) {
    logger.error("Error uploading document:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to upload document" });
  }
}

// Mixed files upload
async function uploadMixedController(req, res) {
  try {
    const files = req.processedFiles;
    if (!files || Object.keys(files).length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No files uploaded" });
    }
    const results = { images: [], documents: [], videos: [], validation: [] };
    for (const [type, fileArray] of Object.entries(files)) {
      for (const file of fileArray) {
        const fileForValidation = {
          originalname: file.originalName,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
        };
        const validation = fileValidator.validateIntegrity(fileForValidation);
        const fileInfo = {
          originalName: file.originalName,
          filename: file.filename,
          url: file.url,
          cloudinaryId: file.cloudinaryId,
          size: file.size,
          mimetype: file.mimetype,
          validation,
        };
        results[type] = results[type] || [];
        results[type].push(fileInfo);
        results.validation.push({
          filename: file.originalName,
          type,
          isValid: validation.isValid,
          issues: validation.issues,
        });
      }
    }
    res.json({ success: true, data: results });
  } catch (error) {
    logger.error("Error uploading mixed files:", error);
    res.status(500).json({ success: false, error: "Failed to upload files" });
  }
}

// Progress tracking upload
async function uploadWithProgressController(req, res) {
  try {
    const uploadId = req.headers["x-upload-id"];
    const files = req.processedFiles;
    if (uploadId) {
      uploadTracker.completeUpload(uploadId, {
        files,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        completedAt: new Date().toISOString(),
      });
    }
    res.json({
      success: true,
      data: {
        uploadId,
        files: files.map((f) => ({
          originalName: f.originalName,
          url: f.url,
          size: f.size,
        })),
        totalFiles: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        status: uploadId ? uploadTracker.getStatus(uploadId) : null,
      },
    });
  } catch (error) {
    logger.error("Error uploading with progress:", error);
    res.status(500).json({ success: false, error: "Failed to upload files" });
  }
}

// Optimize image
async function optimizeImageController(req, res) {
  try {
    const { cloudinaryId, options = {} } = req.body;
    if (!cloudinaryId) {
      return res
        .status(400)
        .json({ success: false, error: "Cloudinary ID is required" });
    }
    const optimized = await imageOptimizer.optimize(cloudinaryId, options);
    const responsive =
      await imageOptimizer.generateResponsiveImages(cloudinaryId);
    res.json({
      success: true,
      data: {
        originalId: cloudinaryId,
        optimized,
        responsive,
      },
    });
  } catch (error) {
    logger.error("Error optimizing image:", error);
    res.status(500).json({ success: false, error: "Failed to optimize image" });
  }
}

// Cleanup files
async function cleanupController(req, res) {
  try {
    const { maxAge = 24 * 60 * 60 * 1000 } = req.body;
    const cleanedCount = await fileManager.cleanupOldFiles(
      "uploads/temp",
      maxAge
    );
    uploadTracker.cleanupOldRecords(maxAge);
    res.json({
      success: true,
      data: {
        cleanedCount,
        message: `Cleaned up ${cleanedCount} old files`,
      },
    });
  } catch (error) {
    logger.error("Error cleaning up files:", error);
    res.status(500).json({ success: false, error: "Failed to clean up files" });
  }
}

// Virus scan
async function scanController(req, res) {
  try {
    const { file } = req.body;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, error: "File information is required" });
    }
    const scanResult = await fileValidator.scanForViruses(file);
    res.json({ success: true, data: scanResult });
  } catch (error) {
    logger.error("Error scanning file:", error);
    res.status(500).json({ success: false, error: "Failed to scan file" });
  }
}

// Stats
function statsController(req, res) {
  try {
    const stats = fileManager.getFileStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error("Error getting upload stats:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get upload statistics" });
  }
}

// Progress
function progressController(req, res) {
  try {
    const status = uploadTracker.getStatus(req.params.uploadId);
    if (!status) {
      return res
        .status(404)
        .json({ success: false, error: "Upload not found" });
    }
    res.json({ success: true, data: status });
  } catch (error) {
    logger.error("Error getting upload progress:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get upload progress" });
  }
}

module.exports = {
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
};
