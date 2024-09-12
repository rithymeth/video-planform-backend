const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Joi = require('joi');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const speakeasy = require('speakeasy');

// Validation Schemas
const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

const updateProfileSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    email: Joi.string().email(),
});

const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().min(8).required(),
    newPassword: Joi.string().min(8).required(),
});

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Register User
exports.registerUser = async (req, res, next) => {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ username, email, password: hashedPassword });

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        newUser.emailVerificationToken = emailVerificationToken;
        newUser.isEmailVerified = false;

        await newUser.save();

        // Send verification email
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/users/verify-email/${emailVerificationToken}`;
        await sendEmail({
            email: newUser.email,
            subject: 'Verify your email',
            message: `Please verify your email by clicking on this link: ${verificationUrl}`,
        });

        res.status(201).json({ message: 'User registered successfully! Please check your email to verify your account.' });
    } catch (error) {
        next(error);
    }
};

// Verify Email
exports.verifyEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({ emailVerificationToken: req.params.token });
        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
};

// Login User
exports.loginUser = async (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user.isEmailVerified) return res.status(401).json({ error: 'Please verify your email first' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // Optional: Check if 2FA is enabled and verify OTP
        if (user.twoFactorEnabled) {
            const { otp } = req.body;
            const is2FAValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: otp,
            });
            if (!is2FAValid) return res.status(401).json({ error: 'Invalid 2FA code' });
        }

        const token = generateToken(user);
        res.json({ message: 'Login successful', token });
    } catch (error) {
        next(error);
    }
};

// Logout User
exports.logoutUser = (req, res) => {
    res.json({ message: 'User logged out successfully' });
};

// Fetch User Profile
exports.fetchUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password -twoFactorSecret');
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ user });
    } catch (error) {
        next(error);
    }
};

// Update User Profile
exports.updateUserProfile = async (req, res, next) => {
    const { error } = updateProfileSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { username, email } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();
        res.json({ message: 'Profile updated successfully', user: { username: user.username, email: user.email } });
    } catch (error) {
        next(error);
    }
};

// Change User Password
exports.changePassword = async (req, res, next) => {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid old password' });

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/api/users/reset-password/${token}`;
        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            message: `You requested a password reset. Please click this link to reset your password: ${resetUrl}`,
        });

        res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        next(error);
    }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        user.password = await bcrypt.hash(newPassword, 12);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};

// Enable/Disable 2FA
exports.toggle2FA = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.twoFactorEnabled) {
            user.twoFactorEnabled = false;
            user.twoFactorSecret = undefined;
            await user.save();
            return res.json({ message: '2FA disabled successfully' });
        } else {
            const secret = speakeasy.generateSecret({ length: 20 });
            user.twoFactorSecret = secret.base32;
            user.twoFactorEnabled = true;
            await user.save();

            res.json({
                message: '2FA enabled successfully',
                secret: secret.otpauth_url,
            });
        }
    } catch (error) {
        next(error);
    }
};
