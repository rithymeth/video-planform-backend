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
 *     summary: Upload a new video
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: video
 *         type: file
 *         description: The video file to upload.
 *       - in: formData
 *         name: title
 *         type: string
 *         description: The title of the video.
 *       - in: formData
 *         name: description
 *         type: string
 *         description: The description of the video.
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 */
router.post("/upload", protect, uploadVideoFile, uploadVideo);

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Get all videos
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *         description: Order of sorting (asc or desc)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for video titles
 *     responses:
 *       200:
 *         description: A list of videos
 */
router.get("/", getVideos);

/**
 * @swagger
 * /api/videos/{id}/like:
 *   put:
 *     summary: Like a video
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the video to like
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video liked successfully
 */
router.put("/:id/like", protect, likeVideo);

/**
 * @swagger
 * /api/videos/{id}/comment:
 *   post:
 *     summary: Comment on a video
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the video to comment on
 *         schema:
 *           type: string
 *       - in: body
 *         name: comment
 *         description: The comment to add
 *         schema:
 *           type: object
 *           required:
 *             - text
 *           properties:
 *             text:
 *               type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.post("/:id/comment", protect, commentOnVideo);

/**
 * @swagger
 * /api/videos/{id}/stream:
 *   get:
 *     summary: Stream a video
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the video to stream
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Streaming video
 */
router.get("/:id/stream", streamVideo);

/**
 * @swagger
 * /api/videos/{id}/analytics:
 *   get:
 *     summary: Get video analytics
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the video
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video analytics data
 */
router.get("/:id/analytics", protect, getVideoAnalytics);

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Delete a video
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the video to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video deleted successfully
 */
router.delete("/:id", protect, checkRole(["admin", "moderator"]), deleteVideo);

/**
 * @swagger
 * /api/videos/{id}/embed:
 *   get:
 *     summary: Get embeddable code for a video
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the video
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Embeddable code for the video
 */
router.get("/:id/embed", getEmbedCode);

module.exports = router;
