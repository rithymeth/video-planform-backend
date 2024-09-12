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
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, fetchUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/toggle-2fa', protect, toggle2FA);

module.exports = router;
