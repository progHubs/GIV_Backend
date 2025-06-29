const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "giv-society",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "mp4",
      "mp3",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "csv",
    ],
    resource_type: "auto",
  },
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @returns {Promise<Object>} - Cloudinary upload response
 */
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "giv-society",
      resource_type: "auto",
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  storage,
  uploadToCloudinary,
};
