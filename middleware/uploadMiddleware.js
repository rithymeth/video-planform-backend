const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the directory exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/videos');
    ensureDirExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // Set file size limit to 500 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.mp4', '.mov', '.avi'].includes(ext)) {
      return cb(new Error('Only video files are allowed'), false);
    }
    cb(null, true);
  }
});

module.exports = uploadVideo.single('video'); // Middleware for single video upload
