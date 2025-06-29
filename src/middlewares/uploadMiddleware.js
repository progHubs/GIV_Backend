const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define allowed file types
const FILE_TYPES = {
  IMAGE: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/tiff",
    "image/bmp",
  ],
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/rtf",
    "text/plain",
    "application/x-tex",
  ],
  SPREADSHEET: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/vnd.oasis.opendocument.spreadsheet",
  ],
  VIDEO: [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "video/webm",
    "video/3gpp",
  ],
  AUDIO: [
    "audio/mpeg",
    "audio/wav",
    "audio/midi",
    "audio/webm",
    "audio/ogg",
    "audio/aac",
    "audio/x-m4a",
  ],
  ARCHIVE: [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/x-tar",
    "application/gzip",
  ],
};

// Define file size limits (in bytes)
const SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  DOCUMENT: 25 * 1024 * 1024, // 25MB
  SPREADSHEET: 15 * 1024 * 1024, // 15MB
  VIDEO: 500 * 1024 * 1024, // 500MB
  AUDIO: 100 * 1024 * 1024, // 100MB
  ARCHIVE: 200 * 1024 * 1024, // 200MB
};

// Create upload directories if they don't exist
const createUploadDirectories = () => {
  const directories = [
    "uploads",
    "uploads/images",
    "uploads/documents",
    "uploads/spreadsheets",
    "uploads/videos",
    "uploads/audio",
    "uploads/archives",
  ];
  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirectories();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";

    if (FILE_TYPES.IMAGE.includes(file.mimetype)) {
      uploadPath += "images/";
    } else if (FILE_TYPES.DOCUMENT.includes(file.mimetype)) {
      uploadPath += "documents/";
    } else if (FILE_TYPES.SPREADSHEET.includes(file.mimetype)) {
      uploadPath += "spreadsheets/";
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
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    ...FILE_TYPES.IMAGE,
    ...FILE_TYPES.DOCUMENT,
    ...FILE_TYPES.SPREADSHEET,
    ...FILE_TYPES.VIDEO,
    ...FILE_TYPES.AUDIO,
    ...FILE_TYPES.ARCHIVE,
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Please check the allowed file types."),
      false
    );
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: Math.max(...Object.values(SIZE_LIMITS)), // Use the largest size limit as default
  },
});

// Specific upload handlers for different file types
const uploadImage = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (FILE_TYPES.IMAGE.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."), false);
    }
  },
  limits: { fileSize: SIZE_LIMITS.IMAGE },
});

const uploadDocument = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (FILE_TYPES.DOCUMENT.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only documents are allowed."), false);
    }
  },
  limits: { fileSize: SIZE_LIMITS.DOCUMENT },
});

const uploadSpreadsheet = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (FILE_TYPES.SPREADSHEET.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only spreadsheets and CSV files are allowed."
        ),
        false
      );
    }
  },
  limits: { fileSize: SIZE_LIMITS.SPREADSHEET },
});

const uploadVideo = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (FILE_TYPES.VIDEO.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only video files are allowed."), false);
    }
  },
  limits: { fileSize: SIZE_LIMITS.VIDEO },
});

const uploadAudio = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (FILE_TYPES.AUDIO.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."), false);
    }
  },
  limits: { fileSize: SIZE_LIMITS.AUDIO },
});

const uploadArchive = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (FILE_TYPES.ARCHIVE.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only archive files are allowed."),
        false
      );
    }
  },
  limits: { fileSize: SIZE_LIMITS.ARCHIVE },
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File size limit exceeded",
        message: "The uploaded file is too large.",
      });
    }
    return res.status(400).json({
      error: err.code,
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: "Upload Error",
      message: err.message,
    });
  }

  next();
};

// Export middleware functions
module.exports = {
  upload: {
    single: upload.single.bind(upload),
    array: upload.array.bind(upload),
    fields: upload.fields.bind(upload),
  },
  uploadImage: {
    single: uploadImage.single.bind(uploadImage),
    array: uploadImage.array.bind(uploadImage),
    fields: uploadImage.fields.bind(uploadImage),
  },
  uploadDocument: {
    single: uploadDocument.single.bind(uploadDocument),
    array: uploadDocument.array.bind(uploadDocument),
    fields: uploadDocument.fields.bind(uploadDocument),
  },
  uploadSpreadsheet: {
    single: uploadSpreadsheet.single.bind(uploadSpreadsheet),
    array: uploadSpreadsheet.array.bind(uploadSpreadsheet),
    fields: uploadSpreadsheet.fields.bind(uploadSpreadsheet),
  },
  uploadVideo: {
    single: uploadVideo.single.bind(uploadVideo),
    array: uploadVideo.array.bind(uploadVideo),
    fields: uploadVideo.fields.bind(uploadVideo),
  },
  uploadAudio: {
    single: uploadAudio.single.bind(uploadAudio),
    array: uploadAudio.array.bind(uploadAudio),
    fields: uploadAudio.fields.bind(uploadAudio),
  },
  uploadArchive: {
    single: uploadArchive.single.bind(uploadArchive),
    array: uploadArchive.array.bind(uploadArchive),
    fields: uploadArchive.fields.bind(uploadArchive),
  },
  handleUploadError,
};
