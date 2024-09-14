const express = require('express');
const {
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser,
    fetchUserProfile,
    updateUserProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    toggle2FA,
    updateProfilePicture,
    searchUsers, // Import the new search function
    addUser      // Import the new add user function if needed
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const uploadImage = require('../middleware/uploadMiddleware');

const router = express.Router();

// User routes
router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, fetchUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/toggle-2fa', protect, toggle2FA);
router.post('/upload/profile-picture', protect, uploadImage, updateProfilePicture);
router.get('/search', protect, searchUsers); // Route for searching users
router.post('/add', protect, addUser); // Route for adding a user

module.exports = router;
