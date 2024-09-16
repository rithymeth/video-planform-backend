const express = require("express");
const {
  getVideoAnalytics,
  getUserAnalytics,
  getPlatformAnalytics,
} = require("../controllers/analyticsController"); // Ensure these functions are properly implemented in the controller
const protect = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/analytics/video/:id:
 *   get:
 *     description: Get analytics for a specific video
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 */
router.get("/video/:id", protect, getVideoAnalytics);

/**
 * @swagger
 * /api/analytics/user/:id:
 *   get:
 *     description: Get analytics for a specific user
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 */
router.get(
  "/user/:id",
  protect,
  checkRole(["admin", "moderator"]),
  getUserAnalytics
);

/**
 * @swagger
 * /api/analytics/platform:
 *   get:
 *     description: Get overall platform analytics
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 */
router.get("/platform", protect, checkRole(["admin"]), getPlatformAnalytics);

module.exports = router;
