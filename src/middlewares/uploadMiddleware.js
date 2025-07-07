const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  cloudinary,
  uploadToCloudinary,
} = require("../config/cloudinary.config");
const logger = require("../utils/logger.util");

// Enhanced file type definitions with more comprehensive support
const FILE_TYPES = {
  IMAGE: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/tiff",
    "image/bmp",
    "image/avif",
    "image/heic",
    "image/heif",
  ],
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/rtf",
    "text/plain",
    "application/x-tex",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.apple.pages",
  ],
  SPREADSHEET: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.apple.numbers",
  ],
  PRESENTATION: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.oasis.opendocument.presentation",
    "application/vnd.apple.keynote",
  ],
  VIDEO: [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "video/webm",
    "video/3gpp",
    "video/avi",
    "video/mov",
    "video/flv",
    "video/wmv",
  ],
  AUDIO: [
    "audio/mpeg",
    "audio/wav",
    "audio/midi",
    "audio/webm",
    "audio/ogg",
    "audio/aac",
    "audio/x-m4a",
    "audio/flac",
    "audio/opus",
  ],
  ARCHIVE: [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/x-tar",
    "application/gzip",
    "application/x-bzip2",
  ],
};

// Enhanced size limits with better categorization
const SIZE_LIMITS = {
  IMAGE: 15 * 1024 * 1024, // 15MB (increased for high-res images)
  DOCUMENT: 50 * 1024 * 1024, // 50MB (increased for large documents)
  SPREADSHEET: 25 * 1024 * 1024, // 25MB
  PRESENTATION: 30 * 1024 * 1024, // 30MB
  VIDEO: 1 * 1024 * 1024 * 1024, // 1GB (increased for HD videos)
  AUDIO: 200 * 1024 * 1024, // 200MB (increased for high-quality audio)
  ARCHIVE: 500 * 1024 * 1024, // 500MB (increased for large archives)
};

// Configuration options
const UPLOAD_CONFIG = {
  // Storage options: 'local', 'cloudinary', 'hybrid'
  STORAGE_TYPE: process.env.UPLOAD_STORAGE_TYPE || "hybrid",

  // Image processing options
  IMAGE_PROCESSING: {
    enabled: true,
    quality: 85,
    format: "auto",
    transformation: {
      width: "auto",
      height: "auto",
      crop: "limit",
      gravity: "auto",
    },
  },

  // Security options
  SECURITY: {
    virusScan: process.env.ENABLE_VIRUS_SCAN === "true",
    maxFiles: 10,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || ["*"],
  },

  // Cleanup options
  CLEANUP: {
    autoCleanup: true,
    cleanupInterval: 24 * 60 * 60 * 1000, // 24 hours
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

// Create upload directories if they don't exist
const createUploadDirectories = () => {
  const directories = [
    "uploads",
    "uploads/images",
    "uploads/documents",
    "uploads/spreadsheets",
    "uploads/presentations",
    "uploads/videos",
    "uploads/audio",
    "uploads/archives",
    "uploads/temp",
  ];
  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirectories();

// Enhanced storage configuration with multiple options
const createStorage = (storageType = "local") => {
  switch (storageType) {
    case "cloudinary":
      return multer.memoryStorage(); // Use memory storage for Cloudinary
    case "hybrid":
      return multer.diskStorage({
        destination: (req, file, cb) => {
          let uploadPath = "uploads/temp/"; // Use temp for hybrid approach
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname +
              "-" +
              uniqueSuffix +
              path.extname(file.originalname)
          );
        },
      });
    default:
      return multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";

    if (FILE_TYPES.IMAGE.includes(file.mimetype)) {
      uploadPath += "images/";
    } else if (FILE_TYPES.DOCUMENT.includes(file.mimetype)) {
      uploadPath += "documents/";
    } else if (FILE_TYPES.SPREADSHEET.includes(file.mimetype)) {
      uploadPath += "spreadsheets/";
          } else if (FILE_TYPES.PRESENTATION.includes(file.mimetype)) {
            uploadPath += "presentations/";
    } else if (FILE_TYPES.VIDEO.includes(file.mimetype)) {
      uploadPath += "videos/";
    } else if (FILE_TYPES.AUDIO.includes(file.mimetype)) {
      uploadPath += "audio/";
    } else if (FILE_TYPES.ARCHIVE.includes(file.mimetype)) {
      uploadPath += "archives/";
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
            file.fieldname +
              "-" +
              uniqueSuffix +
              path.extname(file.originalname)
    );
  },
});
  }
};

// Enhanced file filter with better validation
const createFileFilter = (allowedTypes = null) => {
  return (req, file, cb) => {
    // Check file type
    const allAllowedTypes = allowedTypes || [
    ...FILE_TYPES.IMAGE,
    ...FILE_TYPES.DOCUMENT,
    ...FILE_TYPES.SPREADSHEET,
      ...FILE_TYPES.PRESENTATION,
    ...FILE_TYPES.VIDEO,
    ...FILE_TYPES.AUDIO,
    ...FILE_TYPES.ARCHIVE,
  ];

    if (!allAllowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Allowed types: ${allAllowedTypes.join(", ")}`
        ),
        false
      );
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".csv": "text/csv",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
      ".zip": "application/zip",
    };

    if (allowedExtensions[ext] && allowedExtensions[ext] !== file.mimetype) {
      return cb(new Error(`File extension doesn't match MIME type`), false);
    }

    // Additional security checks
    if (
      file.originalname.includes("..") ||
      file.originalname.includes("/") ||
      file.originalname.includes("\\")
    ) {
      return cb(new Error("Invalid filename"), false);
    }

      cb(null, true);
  };
};

// Create multer instances with enhanced configuration
const createMulterInstance = (
  fileType = null,
  storageType = UPLOAD_CONFIG.STORAGE_TYPE
) => {
  const storage = createStorage(storageType);
  const fileFilter = createFileFilter(fileType ? FILE_TYPES[fileType] : null);
  const sizeLimit = fileType
    ? SIZE_LIMITS[fileType]
    : Math.max(...Object.values(SIZE_LIMITS));

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: sizeLimit,
      files: UPLOAD_CONFIG.SECURITY.maxFiles,
    },
  });
};

// Create specific upload handlers
const upload = createMulterInstance();
const uploadImage = createMulterInstance("IMAGE");
const uploadDocument = createMulterInstance("DOCUMENT");
const uploadSpreadsheet = createMulterInstance("SPREADSHEET");
const uploadPresentation = createMulterInstance("PRESENTATION");
const uploadVideo = createMulterInstance("VIDEO");
const uploadAudio = createMulterInstance("AUDIO");
const uploadArchive = createMulterInstance("ARCHIVE");

// Enhanced error handling middleware
const handleUploadError = (err, req, res, next) => {
  logger.error("Upload error:", err);

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
      return res.status(400).json({
          success: false,
        error: "File size limit exceeded",
          message: `File size exceeds the maximum allowed size.`,
          details: {
            maxSize: err.limit,
            receivedSize: err.received,
          },
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          error: "Too many files",
          message: `Maximum ${UPLOAD_CONFIG.SECURITY.maxFiles} files allowed per upload.`,
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          error: "Unexpected file field",
          message: "File field name not expected.",
      });
      default:
    return res.status(400).json({
          success: false,
      error: err.code,
      message: err.message,
    });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: "Upload Error",
      message: err.message,
    });
  }

  next();
};

// Post-upload processing middleware
const processUpload = async (req, res, next) => {
  try {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.file ? [req.file] : req.files;
    const processedFiles = [];

    for (const file of files) {
      let processedFile = {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: null,
        cloudinaryId: null,
      };

      // Process based on storage type
      if (
        UPLOAD_CONFIG.STORAGE_TYPE === "cloudinary" ||
        UPLOAD_CONFIG.STORAGE_TYPE === "hybrid"
      ) {
        try {
          const result = await uploadToCloudinary(file.path || file.buffer);
          processedFile.url = result.secure_url;
          processedFile.cloudinaryId = result.public_id;

          // Clean up local file if using hybrid approach
          if (
            UPLOAD_CONFIG.STORAGE_TYPE === "hybrid" &&
            file.path &&
            fs.existsSync(file.path)
          ) {
            fs.unlinkSync(file.path);
          }
        } catch (cloudinaryError) {
          logger.error("Cloudinary upload failed:", cloudinaryError);
          // Fallback to local storage
          if (file.path) {
            processedFile.url = `/uploads/${file.filename}`;
          }
        }
      } else {
        // Local storage
        processedFile.url = `/uploads/${file.filename}`;
      }

      processedFiles.push(processedFile);
    }

    // Attach processed files to request
    if (req.file) {
      req.processedFile = processedFiles[0];
    } else if (req.files) {
      req.processedFiles = processedFiles;
    }

    next();
  } catch (error) {
    logger.error("Post-upload processing error:", error);
    next(error);
  }
};

// Cleanup middleware for temporary files
const cleanupTempFiles = async (req, res, next) => {
  try {
    if (req.file && req.file.path && req.file.path.includes("/temp/")) {
      setTimeout(() => {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }, 60000); // Clean up after 1 minute
    }
    next();
  } catch (error) {
    logger.error("Cleanup error:", error);
    next();
  }
};

// Additional utility functions for enhanced functionality
const imageOptimizer = {
  /**
   * Optimize image using Cloudinary transformations
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} options - Optimization options
   * @returns {Promise<Object>} - Optimized image result
   */
  optimize: async (publicId, options = {}) => {
    try {
      const defaultOptions = {
        quality: "auto",
        format: "auto",
        width: "auto",
        height: "auto",
        crop: "limit",
        gravity: "auto",
        ...options,
      };

      const result = await cloudinary.url(publicId, {
        transformation: [defaultOptions],
      });

      return { url: result, publicId };
    } catch (error) {
      logger.error("Image optimization failed:", error);
      throw error;
    }
  },

  /**
   * Generate multiple image sizes for responsive design
   * @param {string} publicId - Cloudinary public ID
   * @param {Array} sizes - Array of sizes to generate
   * @returns {Promise<Object>} - Multiple sized images
   */
  generateResponsiveImages: async (
    publicId,
    sizes = [320, 640, 1024, 1920]
  ) => {
    try {
      const variants = {};

      for (const size of sizes) {
        const url = cloudinary.url(publicId, {
          transformation: [
            {
              width: size,
              height: size,
              crop: "limit",
              quality: "auto",
            },
          ],
        });
        variants[`w${size}`] = url;
      }

      return variants;
    } catch (error) {
      logger.error("Responsive image generation failed:", error);
      throw error;
    }
  },
};

// File validation utilities
const fileValidator = {
  /**
   * Validate file integrity
   * @param {Object} file - File object
   * @returns {Object} - Validation result
   */
  validateIntegrity: (file) => {
    const issues = [];

    // Check if file object exists and has required properties
    if (!file) {
      issues.push("File object is missing");
      return {
        isValid: false,
        issues,
      };
    }

    // Check file size
    if (!file.size || file.size === 0) {
      issues.push("File is empty or size is invalid");
    }

    // Check for suspicious patterns in filename
    if (file.originalname) {
      const suspiciousPatterns = ["../", "..\\", "cmd", "com", "bat", "exe"];
      const filename = file.originalname.toLowerCase();
      for (const pattern of suspiciousPatterns) {
        if (filename.includes(pattern)) {
          issues.push(`Suspicious pattern detected: ${pattern}`);
        }
      }

      // Check file extension vs MIME type
      const ext = path.extname(file.originalname).toLowerCase();
      const mimeToExt = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "application/pdf": ".pdf",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          ".docx",
      };

      if (
        file.mimetype &&
        mimeToExt[file.mimetype] &&
        ext !== mimeToExt[file.mimetype]
      ) {
        issues.push("File extension does not match MIME type");
      }
    } else {
      issues.push("File original name is missing");
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  },

  /**
   * Simulate virus scanning (replace with actual virus scanning service)
   * @param {Object} file - File object
   * @returns {Promise<Object>} - Scan result
   */
  scanForViruses: async (file) => {
    // This is a simulation - replace with actual virus scanning service
    // like ClamAV, VirusTotal API, or similar
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 99.9% clean files
        const isClean = Math.random() > 0.001;
        resolve({
          isClean,
          scanned: true,
          timestamp: new Date().toISOString(),
          details: isClean
            ? "File appears to be clean"
            : "Potential threat detected",
        });
      }, 100);
    });
  },
};

// File management utilities
const fileManager = {
  /**
   * Clean up old temporary files
   * @param {string} directory - Directory to clean
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {Promise<number>} - Number of files cleaned
   */
  cleanupOldFiles: async (
    directory = "uploads/temp",
    maxAge = 24 * 60 * 60 * 1000
  ) => {
    try {
      if (!fs.existsSync(directory)) {
        return 0;
      }

      const files = fs.readdirSync(directory);
      const now = Date.now();
      let cleanedCount = 0;

      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      }

      logger.info(`Cleaned up ${cleanedCount} old files from ${directory}`);
      return cleanedCount;
    } catch (error) {
      logger.error("File cleanup failed:", error);
      return 0;
    }
  },

  /**
   * Get file statistics
   * @param {string} directory - Directory to analyze
   * @returns {Object} - File statistics
   */
  getFileStats: (directory = "uploads") => {
    try {
      if (!fs.existsSync(directory)) {
        return { totalFiles: 0, totalSize: 0, byType: {} };
      }

      const stats = { totalFiles: 0, totalSize: 0, byType: {} };

      const scanDirectory = (dir) => {
        const items = fs.readdirSync(dir);

        for (const item of items) {
          const itemPath = path.join(dir, item);
          const itemStats = fs.statSync(itemPath);

          if (itemStats.isDirectory()) {
            scanDirectory(itemPath);
          } else {
            stats.totalFiles++;
            stats.totalSize += itemStats.size;

            const ext = path.extname(item).toLowerCase();
            stats.byType[ext] = (stats.byType[ext] || 0) + 1;
          }
        }
      };

      scanDirectory(directory);
      return stats;
    } catch (error) {
      logger.error("File stats collection failed:", error);
      return { totalFiles: 0, totalSize: 0, byType: {} };
    }
  },
};

// Enhanced upload progress tracking
const uploadTracker = {
  uploads: new Map(),

  /**
   * Start tracking an upload
   * @param {string} uploadId - Unique upload ID
   * @param {Object} metadata - Upload metadata
   */
  startTracking: (uploadId, metadata = {}) => {
    uploadTracker.uploads.set(uploadId, {
      id: uploadId,
      startTime: Date.now(),
      status: "uploading",
      progress: 0,
      files: [],
      metadata,
      errors: [],
    });
  },

  /**
   * Update upload progress
   * @param {string} uploadId - Upload ID
   * @param {number} progress - Progress percentage
   * @param {Object} file - File information
   */
  updateProgress: (uploadId, progress, file = null) => {
    const upload = uploadTracker.uploads.get(uploadId);
    if (upload) {
      upload.progress = progress;
      if (file) {
        upload.files.push(file);
      }
    }
  },

  /**
   * Complete upload tracking
   * @param {string} uploadId - Upload ID
   * @param {Object} result - Upload result
   */
  completeUpload: (uploadId, result) => {
    const upload = uploadTracker.uploads.get(uploadId);
    if (upload) {
      upload.status = "completed";
      upload.endTime = Date.now();
      upload.result = result;
      upload.duration = upload.endTime - upload.startTime;
    }
  },

  /**
   * Get upload status
   * @param {string} uploadId - Upload ID
   * @returns {Object} - Upload status
   */
  getStatus: (uploadId) => {
    return uploadTracker.uploads.get(uploadId) || null;
  },

  /**
   * Clean up old upload records
   * @param {number} maxAge - Maximum age in milliseconds
   */
  cleanupOldRecords: (maxAge = 24 * 60 * 60 * 1000) => {
    const now = Date.now();
    for (const [id, upload] of uploadTracker.uploads.entries()) {
      if (upload.endTime && now - upload.endTime > maxAge) {
        uploadTracker.uploads.delete(id);
      }
    }
  },
};

// Export enhanced middleware functions with additional utilities
module.exports = {
  // Basic upload handlers
  upload: {
    single: (fieldName) => upload.single(fieldName),
    array: (fieldName, maxCount) => upload.array(fieldName, maxCount),
    fields: (fields) => upload.fields(fields),
  },

  // Specialized upload handlers
  uploadImage: {
    single: (fieldName) => uploadImage.single(fieldName),
    array: (fieldName, maxCount) => uploadImage.array(fieldName, maxCount),
    fields: (fields) => uploadImage.fields(fields),
  },

  uploadDocument: {
    single: (fieldName) => uploadDocument.single(fieldName),
    array: (fieldName, maxCount) => uploadDocument.array(fieldName, maxCount),
    fields: (fields) => uploadDocument.fields(fields),
  },

  uploadSpreadsheet: {
    single: (fieldName) => uploadSpreadsheet.single(fieldName),
    array: (fieldName, maxCount) =>
      uploadSpreadsheet.array(fieldName, maxCount),
    fields: (fields) => uploadSpreadsheet.fields(fields),
  },

  uploadPresentation: {
    single: (fieldName) => uploadPresentation.single(fieldName),
    array: (fieldName, maxCount) =>
      uploadPresentation.array(fieldName, maxCount),
    fields: (fields) => uploadPresentation.fields(fields),
  },

  uploadVideo: {
    single: (fieldName) => uploadVideo.single(fieldName),
    array: (fieldName, maxCount) => uploadVideo.array(fieldName, maxCount),
    fields: (fields) => uploadVideo.fields(fields),
  },

  uploadAudio: {
    single: (fieldName) => uploadAudio.single(fieldName),
    array: (fieldName, maxCount) => uploadAudio.array(fieldName, maxCount),
    fields: (fields) => uploadAudio.fields(fields),
  },

  uploadArchive: {
    single: (fieldName) => uploadArchive.single(fieldName),
    array: (fieldName, maxCount) => uploadArchive.array(fieldName, maxCount),
    fields: (fields) => uploadArchive.fields(fields),
  },

  // Utility functions
  handleUploadError,
  processUpload,
  cleanupTempFiles,

  // Advanced utilities
  imageOptimizer,
  fileValidator,
  fileManager,
  uploadTracker,

  // Configuration
  FILE_TYPES,
  SIZE_LIMITS,
  UPLOAD_CONFIG,
};
