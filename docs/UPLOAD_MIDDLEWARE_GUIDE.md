# Enhanced Upload Middleware Guide

## Overview

The enhanced upload middleware provides powerful file upload capabilities with cloud storage integration, image optimization, security features, and comprehensive error handling.

## Key Features

### 🚀 **Enhanced Capabilities**

- **Multi-storage support**: Local, Cloudinary, or hybrid approach
- **Image optimization**: Automatic resizing, compression, and format conversion
- **Security features**: File validation, virus scanning simulation, and integrity checks
- **Progress tracking**: Real-time upload progress monitoring
- **File management**: Automatic cleanup and statistics
- **Responsive images**: Multiple sizes for different devices

### 📁 **Supported File Types**

| Category          | Formats                                          | Size Limit |
| ----------------- | ------------------------------------------------ | ---------- |
| **Images**        | JPEG, PNG, GIF, WebP, SVG, TIFF, BMP, AVIF, HEIC | 15MB       |
| **Documents**     | PDF, DOC, DOCX, RTF, TXT, TeX, ODT, Pages        | 50MB       |
| **Spreadsheets**  | XLS, XLSX, CSV, ODS, Numbers                     | 25MB       |
| **Presentations** | PPT, PPTX, ODP, Keynote                          | 30MB       |
| **Videos**        | MP4, MPEG, MOV, AVI, WMV, WebM, FLV              | 1GB        |
| **Audio**         | MP3, WAV, MIDI, OGG, AAC, FLAC, Opus             | 200MB      |
| **Archives**      | ZIP, RAR, 7Z, TAR, GZIP, BZIP2                   | 500MB      |

## Configuration

### Environment Variables

```bash
# Storage Configuration
UPLOAD_STORAGE_TYPE=hybrid  # local, cloudinary, hybrid

# Security Configuration
ENABLE_VIRUS_SCAN=true
ALLOWED_ORIGINS=*  # Comma-separated list

# Cloudinary Configuration (if using cloud storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Usage Examples

### 1. Basic Image Upload

```javascript
const express = require("express");
const { uploadImage } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Single image upload
router.post("/upload-avatar", uploadImage.single("avatar"), (req, res) => {
  const file = req.processedFile;
  res.json({
    success: true,
    data: {
      originalName: file.originalName,
      url: file.url,
      cloudinaryId: file.cloudinaryId,
      size: file.size,
    },
  });
});
```

### 2. Multiple File Upload

```javascript
// Multiple images with progress tracking
router.post(
  "/upload-gallery",
  uploadImage.array("images", 10),
  async (req, res) => {
    const files = req.processedFiles;

    // Generate responsive images for each uploaded image
    const responsiveImages = {};
    for (const file of files) {
      if (file.cloudinaryId) {
        responsiveImages[file.originalName] =
          await imageOptimizer.generateResponsiveImages(file.cloudinaryId);
      }
    }

    res.json({
      success: true,
      data: {
        files: files.map((f) => ({
          originalName: f.originalName,
          url: f.url,
          size: f.size,
        })),
        responsiveImages,
      },
    });
  }
);
```

### 3. Mixed File Types

```javascript
// Upload different file types in one request
router.post(
  "/upload-content",
  upload.fields([
    { name: "featured_image", maxCount: 1 },
    { name: "documents", maxCount: 5 },
    { name: "videos", maxCount: 3 },
  ]),
  async (req, res) => {
    const { featured_image, documents, videos } = req.processedFiles;

    // Validate file integrity
    const validationResults = [];
    for (const fileGroup of [featured_image, documents, videos]) {
      for (const file of fileGroup) {
        const validation = fileValidator.validateIntegrity(file);
        validationResults.push({
          filename: file.originalName,
          isValid: validation.isValid,
          issues: validation.issues,
        });
      }
    }

    res.json({
      success: true,
      data: {
        featured_image: featured_image?.[0],
        documents,
        videos,
        validation: validationResults,
      },
    });
  }
);
```

### 4. Advanced Image Processing

```javascript
// Upload and optimize images
router.post(
  "/upload-optimized-images",
  uploadImage.array("images", 5),
  async (req, res) => {
    const files = req.processedFiles;
    const optimizedImages = [];

    for (const file of files) {
      if (file.cloudinaryId) {
        // Optimize each image
        const optimized = await imageOptimizer.optimize(file.cloudinaryId, {
          quality: 85,
          width: 1200,
          height: 800,
          crop: "limit",
        });

        // Generate responsive variants
        const responsive = await imageOptimizer.generateResponsiveImages(
          file.cloudinaryId
        );

        optimizedImages.push({
          original: file,
          optimized,
          responsive,
        });
      }
    }

    res.json({
      success: true,
      data: optimizedImages,
    });
  }
);
```

### 5. Upload with Progress Tracking

```javascript
// Upload with progress tracking
router.post(
  "/upload-with-progress",
  upload.array("files", 5),
  async (req, res) => {
    const uploadId = req.headers["x-upload-id"];

    if (uploadId) {
      uploadTracker.completeUpload(uploadId, {
        files: req.processedFiles,
        totalSize: req.processedFiles.reduce((sum, f) => sum + f.size, 0),
      });
    }

    res.json({
      success: true,
      data: {
        uploadId,
        files: req.processedFiles,
        status: uploadTracker.getStatus(uploadId),
      },
    });
  }
);

// Get upload progress
router.get("/upload-progress/:uploadId", (req, res) => {
  const status = uploadTracker.getStatus(req.params.uploadId);
  res.json({
    success: true,
    data: status,
  });
});
```

### 6. File Management

```javascript
// Get upload statistics
router.get("/upload-stats", (req, res) => {
  const stats = fileManager.getFileStats();
  res.json({
    success: true,
    data: stats,
  });
});

// Clean up old files
router.post("/cleanup-files", async (req, res) => {
  const cleanedCount = await fileManager.cleanupOldFiles();
  res.json({
    success: true,
    data: { cleanedCount },
  });
});
```

## Error Handling

The middleware provides comprehensive error handling:

```javascript
// Error handling middleware is automatically applied
// Common error responses:

// File too large
{
  "success": false,
  "error": "File size limit exceeded",
  "message": "File size exceeds the maximum allowed size.",
  "details": {
    "maxSize": 15728640,
    "receivedSize": 20971520
  }
}

// Invalid file type
{
  "success": false,
  "error": "Upload Error",
  "message": "Invalid file type: application/octet-stream. Allowed types: image/jpeg, image/png, ..."
}

// Too many files
{
  "success": false,
  "error": "Too many files",
  "message": "Maximum 10 files allowed per upload."
}
```

## Security Features

### 1. File Validation

- MIME type verification
- File extension validation
- Suspicious pattern detection
- Empty file detection

### 2. Virus Scanning (Simulation)

```javascript
// Enable virus scanning
const virusScanResult = await fileValidator.scanForViruses(file);
if (!virusScanResult.isClean) {
  // Handle infected file
}
```

### 3. File Integrity Checks

```javascript
const validation = fileValidator.validateIntegrity(file);
if (!validation.isValid) {
  // Handle validation issues
  console.log("Validation issues:", validation.issues);
}
```

## Best Practices

### 1. **Use Appropriate Upload Handlers**

```javascript
// For images only
uploadImage.single("image");

// For documents only
uploadDocument.array("documents", 5);

// For mixed content
upload.fields([
  { name: "image", maxCount: 1 },
  { name: "documents", maxCount: 3 },
]);
```

### 2. **Implement Progress Tracking**

```javascript
// Client-side progress tracking
const uploadId = generateUUID();
const formData = new FormData();

// Add upload ID to headers
fetch("/upload", {
  method: "POST",
  headers: { "x-upload-id": uploadId },
  body: formData,
});

// Check progress
setInterval(() => {
  fetch(`/upload-progress/${uploadId}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Progress:", data.data.progress);
    });
}, 1000);
```

### 3. **Handle Cloud Storage Gracefully**

```javascript
// Always provide fallback for cloud storage failures
try {
  const result = await uploadToCloudinary(file.path);
  return result.secure_url;
} catch (error) {
  // Fallback to local storage
  return `/uploads/${file.filename}`;
}
```

### 4. **Implement Cleanup**

```javascript
// Set up automatic cleanup
setInterval(
  () => {
    fileManager.cleanupOldFiles();
    uploadTracker.cleanupOldRecords();
  },
  24 * 60 * 60 * 1000
); // Daily cleanup
```

## Performance Optimization

### 1. **Use Hybrid Storage**

- Upload to temp directory first
- Process with Cloudinary
- Clean up local files
- Provides best of both worlds

### 2. **Image Optimization**

```javascript
// Optimize images automatically
const optimizedUrl = await imageOptimizer.optimize(cloudinaryId, {
  quality: "auto",
  format: "auto",
  width: "auto",
});
```

### 3. **Responsive Images**

```javascript
// Generate multiple sizes
const responsiveImages =
  await imageOptimizer.generateResponsiveImages(cloudinaryId);
// Returns: { w320: url, w640: url, w1024: url, w1920: url }
```

## Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check file size limits
   - Verify file type is allowed
   - Ensure directory permissions

2. **Cloudinary Upload Fails**
   - Verify Cloudinary credentials
   - Check network connectivity
   - Review Cloudinary account limits

3. **Memory Issues**
   - Use disk storage for large files
   - Implement proper cleanup
   - Monitor file statistics

### Debug Mode

Enable debug logging:

```javascript
// In your route
console.log("Upload config:", UPLOAD_CONFIG);
console.log("Processed files:", req.processedFiles);
```

## Migration from Old Middleware

If you're upgrading from the old upload middleware:

1. **Update imports**:

```javascript
// Old
const { uploadImage } = require("../middlewares/uploadMiddleware");

// New (same import, enhanced functionality)
const { uploadImage } = require("../middlewares/uploadMiddleware");
```

2. **Update route handlers**:

```javascript
// Old
router.post("/upload", uploadImage.single("image"), (req, res) => {
  const file = req.file;
  // Handle file
});

// New
router.post("/upload", uploadImage.single("image"), (req, res) => {
  const file = req.processedFile; // Enhanced file object
  // Handle file with additional properties
});
```

The enhanced middleware is backward compatible while providing many new features and improvements.
