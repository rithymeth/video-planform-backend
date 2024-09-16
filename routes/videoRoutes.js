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
} = require("../controllers/videoController");
const protect = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/videos/upload:
 *   post:
 *     description: Upload a new video
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 */
router.post("/upload", protect, uploadVideoFile, uploadVideo);
router.get("/", getVideos);
router.put("/:id/like", protect, likeVideo);
router.post("/:id/comment", protect, commentOnVideo);
router.get("/:id/stream", streamVideo);
router.get("/:id/analytics", protect, getVideoAnalytics);
router.delete("/:id", protect, checkRole(["admin", "moderator"]), deleteVideo);
router.get("/:id/embed", getEmbedCode);

module.exports = router;
