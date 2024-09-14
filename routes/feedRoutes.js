const express = require('express');
const { getUserFeed } = require('../controllers/feedController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getUserFeed); // Ensure the route is protected and uses the getUserFeed function

module.exports = router;
