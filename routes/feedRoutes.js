const express = require('express');
const { getUserFeed } = require('../controllers/feedController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Route to get user feed
router.get('/', protect, getUserFeed);

module.exports = router;
