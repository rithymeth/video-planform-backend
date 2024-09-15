const express = require("express");
const {
  uploadVideo,
  getVideos,
  likeVideo,
  commentOnVideo,
  uploadVideoFile,
  streamVideo,
  deleteVideo,
  getEmbedCode,
  getVideoAnalytics,
} = require("../controllers/videoController"); // Correctly import only video-related functions
const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

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

// Route to get video analytics
router.get("/:id/analytics", protect, getVideoAnalytics);

// Route to delete a video (Admin and Moderator only)
router.delete("/:id", protect, checkRole(["admin", "moderator"]), deleteVideo);

// Route to get embed code for a video
router.get("/:id/embed", getEmbedCode);

module.exports = router;
