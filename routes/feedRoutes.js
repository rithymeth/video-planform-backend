const express = require('express');
const { getUserFeed } = require('../controllers/feedController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/feed:
 *   get:
 *     description: Get the user feed
 *     responses:
 *       200:
 *         description: Successfully retrieved feed
 */
router.get('/', protect, getUserFeed);

module.exports = router;
