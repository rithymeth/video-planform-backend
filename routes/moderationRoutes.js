const express = require("express");
const {
  getFlaggedContent,
  reviewFlaggedContent,
  banUser,
  unbanUser,
  getAllReports,
  resolveReport,
} = require("../controllers/moderationController");
const protect = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware"); // Ensure this import is correct

const router = express.Router();

/**
 * @swagger
 * /api/moderate/flagged:
 *   get:
 *     description: Get all flagged content
 *     responses:
 *       200:
 *         description: List of flagged content
 */
router.get(
  "/flagged",
  protect,
  checkRole(["admin", "moderator"]),
  getFlaggedContent
);

/**
 * @swagger
 * /api/moderate/flagged/:id:
 *   post:
 *     description: Review flagged content
 *     responses:
 *       200:
 *         description: Flagged content reviewed successfully
 */
router.post(
  "/flagged/:id",
  protect,
  checkRole(["admin", "moderator"]),
  reviewFlaggedContent
);

/**
 * @swagger
 * /api/moderate/ban/:id:
 *   post:
 *     description: Ban a user by ID
 *     responses:
 *       200:
 *         description: User banned successfully
 */
router.post("/ban/:id", protect, checkRole(["admin"]), banUser);

/**
 * @swagger
 * /api/moderate/unban/:id:
 *   post:
 *     description: Unban a user by ID
 *     responses:
 *       200:
 *         description: User unbanned successfully
 */
router.post("/unban/:id", protect, checkRole(["admin"]), unbanUser);

/**
 * @swagger
 * /api/moderate/reports:
 *   get:
 *     description: Get all user reports
 *     responses:
 *       200:
 *         description: List of all user reports
 */
router.get(
  "/reports",
  protect,
  checkRole(["admin", "moderator"]),
  getAllReports
);

/**
 * @swagger
 * /api/moderate/reports/:id:
 *   post:
 *     description: Resolve a user report
 *     responses:
 *       200:
 *         description: User report resolved successfully
 */
router.post(
  "/reports/:id",
  protect,
  checkRole(["admin", "moderator"]),
  resolveReport
);

module.exports = router;
