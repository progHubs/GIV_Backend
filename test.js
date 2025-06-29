const express = require("express");
const router = express.Router();
const path = require("path");
const { cloudinary } = require("./src/config/cloudinary.config");
const {
  uploadImage,
  uploadDocument,
  uploadSpreadsheet,
  uploadVideo,
  uploadAudio,
  handleUploadError,
} = require("./src/middlewares/uploadMiddleware");

// Set up EJS as the view engine
router.set("view engine", "ejs");
router.set("views", path.join(__dirname, "src/views"));

// Render the upload test page
router.get("/test-upload", (req, res) => {
  res.render("Test");
});

// Handle image upload
router.post(
  "/upload/image",
  uploadImage.single("image"),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "giv-society/images",
        resource_type: "image",
      });

      res.json({
        message: "Image uploaded successfully",
        data: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  }
);

// Handle document upload
router.post(
  "/upload/document",
  uploadDocument.single("document"),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "giv-society/documents",
        resource_type: "raw",
      });

      res.json({
        message: "Document uploaded successfully",
        data: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  }
);

// Handle spreadsheet upload
router.post(
  "/upload/spreadsheet",
  uploadSpreadsheet.single("spreadsheet"),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "giv-society/spreadsheets",
        resource_type: "raw",
      });

      res.json({
        message: "Spreadsheet uploaded successfully",
        data: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload spreadsheet" });
    }
  }
);

// Handle video upload
router.post(
  "/upload/video",
  uploadVideo.single("video"),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "giv-society/videos",
        resource_type: "video",
      });

      res.json({
        message: "Video uploaded successfully",
        data: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload video" });
    }
  }
);

// Handle audio upload
router.post(
  "/upload/audio",
  uploadAudio.single("audio"),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "giv-society/audio",
        resource_type: "video", // Cloudinary uses 'video' type for audio files
      });

      res.json({
        message: "Audio uploaded successfully",
        data: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload audio" });
    }
  }
);

// Delete file from Cloudinary
router.delete("/delete/:public_id", async (req, res) => {
  try {
    const result = await cloudinary.uploader.destroy(req.params.public_id);
    res.json({
      message: "File deleted successfully",
      result,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

module.exports = router;
