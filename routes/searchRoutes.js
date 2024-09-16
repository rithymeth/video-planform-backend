const express = require('express');
const { searchContent } = require('../controllers/searchController');

const router = express.Router();

// Route for searching content (e.g., videos, users, etc.)
router.get('/', searchContent);

module.exports = router;