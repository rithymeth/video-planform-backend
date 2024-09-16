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
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const uploadImage = require("../middleware/uploadMiddleware");
const checkPermission = require("../middleware/permissionsMiddleware");

const router = express.Router();

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
router.post("/add", protect, checkPermission(["admin:addUser"]), addUser);
router.delete(
  "/:id",
  protect,
  checkPermission(["admin:deleteVideo"]),
  deleteVideo
);

module.exports = router;
