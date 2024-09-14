const express = require("express");
const {
  uploadVideo,
  getVideos,
  likeVideo,
  commentOnVideo,
  uploadVideoFile,
  streamVideo,
} = require("../controllers/videoController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Route to upload a video
router.post("/upload", protect, uploadVideoFile, uploadVideo);

// Route to get all videos
router.get("/", getVideos);

// Route to like a video
router.put("/:id/like", protect, likeVideo);

// Route to comment on a video
router.post("/:id/comment", protect, commentOnVideo);

// Route to stream a video
router.get("/:id/stream", streamVideo);

module.exports = router;
