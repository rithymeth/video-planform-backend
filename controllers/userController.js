const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Joi = require("joi");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");
const speakeasy = require("speakeasy");

// Validation Schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  twoFactorToken: Joi.string().optional(),
});

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Register User
exports.registerUser = async (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      emailVerificationToken,
      isEmailVerified: false,
    });

    await newUser.save();

    const verificationUrl = `${req.protocol}://${req.get("host")}/api/users/verify-email/${emailVerificationToken}`;
    await sendEmail({
      email: newUser.email,
      subject: "Verify your email",
      message: `Please verify your email by clicking on this link: ${verificationUrl}`,
    });

    res.status(201).json({ message: "User registered successfully! Please check your email to verify your account." });
  } catch (error) {
    next(error);
  }
};

// Verify Email
exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.params.token.trim();
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error during email verification:", error);
    next(error);
  }
};

// Login User
exports.loginUser = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password, twoFactorToken } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.isEmailVerified) return res.status(401).json({ error: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    if (user.twoFactorEnabled) {
      if (!twoFactorToken) {
        const token = speakeasy.totp({ secret: user.twoFactorSecret, encoding: "base32" });
        await sendEmail({ email: user.email, subject: "Your 2FA Code", message: `Your 2FA code is: ${token}` });

        return res.status(200).json({ message: "2FA code sent to your email. Please enter the code to proceed." });
      } else {
        const isValid = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: "base32",
          token: twoFactorToken,
          window: 1,
        });

        if (!isValid) return res.status(401).json({ error: "Invalid 2FA code" });
      }
    }

    const token = generateToken(user);
    res.json({ message: "Login successful", token });
  } catch (error) {
    next(error);
  }
};

// Logout User
exports.logoutUser = (req, res) => {
  res.json({ message: "User logged out successfully" });
};

// Fetch User Profile
exports.fetchUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password -twoFactorSecret");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res, next) => {
  const { username, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();
    res.json({ message: "Profile updated successfully", user: { username: user.username, email: user.email } });
  } catch (error) {
    next(error);
  }
};

// Change User Password
exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid old password" });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${req.protocol}://${req.get("host")}/api/users/reset-password/${token}`;
    await sendEmail({ email: user.email, subject: "Password Reset", message: `You requested a password reset. Please click this link to reset your password: ${resetUrl}` });

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    next(error);
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  const { newPassword } = req.body;
  const { token } = req.params;

  try {
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

// Enable/Disable 2FA
exports.toggle2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.twoFactorEnabled) {
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      await user.save();
      return res.json({ message: "2FA disabled successfully" });
    } else {
      const secret = speakeasy.generateSecret({ length: 20 });
      user.twoFactorSecret = secret.base32;
      user.twoFactorEnabled = true;
      await user.save();

      res.json({ message: "2FA enabled successfully. Use this secret to configure your 2FA app.", secret: secret.otpauth_url });
    }
  } catch (error) {
    next(error);
  }
};

// Update Profile Picture
exports.updateProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.profilePicture = req.file.path;
    await user.save();

    res.json({ message: "Profile picture updated successfully", profilePicture: user.profilePicture });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ error: "Failed to update profile picture." });
  }
};

// Search Users
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query parameter is required" });

    const users = await User.find({ $text: { $search: query } }).select("username email profilePicture");

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users." });
  }
};

// Add User
exports.addUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isEmailVerified: false
    });

    await newUser.save();
    res.status(201).json({ message: "User added successfully!" });
  } catch (error) {
    next(error);
  }
};
