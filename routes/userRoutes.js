const express = require("express");
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
  searchUsers,
  addUser,
  deleteVideo,
} = require("../controllers/userController"); // Make sure the path is correct and all functions are imported
const protect = require("../middleware/authMiddleware");
const uploadImage = require("../middleware/uploadMiddleware");
const checkRole = require("../middleware/roleMiddleware");

const router = express.Router();

// Routes
router.post("/register", registerUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);
router.get("/profile", protect, fetchUserProfile);
router.put("/profile", protect, uploadImage, updateUserProfile);
router.post("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/toggle-2fa", protect, toggle2FA);
router.post(
  "/upload/profile-picture",
  protect,
  uploadImage,
  updateProfilePicture
);
router.get("/search", protect, searchUsers);

// Admin-only routes
router.post("/add", protect, checkRole(["admin"]), addUser);
router.delete("/:id", protect, checkRole(["admin", "moderator"]), deleteVideo);

module.exports = router;
