const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Helper function to ensure the upload directory exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/images"); // Set the folder for storing uploaded images
    ensureDirExists(dir); // Ensure the directory exists
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Configure multer for handling image uploads
const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
      return cb(new Error("Only image files are allowed"), false); // Reject non-image files
    }
    cb(null, true); // Accept the file
  },
}).single("profilePicture"); // Middleware for handling single image upload

// Export middleware
module.exports = (req, res, next) => {
  uploadImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Handle multer-specific errors (e.g., file size limit exceeded)
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Handle other errors
      return res.status(400).json({ error: err.message });
    }
    next(); // Proceed to the next middleware or route handler if no error
  });
};
