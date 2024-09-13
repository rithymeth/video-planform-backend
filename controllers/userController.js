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
    twoFactorToken: Joi.string().optional() // Allow twoFactorToken as an optional field
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

        // Generate a unique email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            emailVerificationToken, // Ensure this field is set correctly
            isEmailVerified: false,
        });

        console.log('Generated token:', emailVerificationToken); // Debugging: Log the generated token

        await newUser.save();

        console.log('Saved user in database:', newUser); // Debugging: Log the saved user

        // Send verification email to the registered user's email
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/users/verify-email/${emailVerificationToken}`;
        await sendEmail({
            email: newUser.email, // Use the user's email address
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
        // Retrieve the token from the request params and trim any whitespace
        const token = req.params.token.trim(); // Corrected way to trim the token

        // Log the received token for debugging
        console.log('Received token:', token);

        // Find the user with the matching verification token
        const user = await User.findOne({ emailVerificationToken: token });

        if (!user) {
            console.log('Token not found or expired in the database.');
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // If a user is found, update their verification status
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined; // Remove the token after successful verification
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error during email verification:', error);
        next(error);
    }
};

// Login User
// Login User
exports.loginUser = async (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password, twoFactorToken } = req.body; // Get the optional 2FA token from the request

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user.isEmailVerified) return res.status(401).json({ error: 'Please verify your email first' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        if (user.twoFactorEnabled) {
            // If 2FA is enabled, generate a token and send it via email
            if (!twoFactorToken) {
                // If 2FA token is not provided, generate and send a new one
                const token = speakeasy.totp({
                    secret: user.twoFactorSecret,
                    encoding: 'base32',
                });

                // Send the token via email
                await sendEmail({
                    email: user.email,
                    subject: 'Your 2FA Code',
                    message: `Your 2FA code is: ${token}`,
                });

                return res.status(200).json({ message: '2FA code sent to your email. Please enter the code to proceed.' });
            } else {
                // Verify the provided 2FA token
                const isValid = speakeasy.totp.verify({
                    secret: user.twoFactorSecret,
                    encoding: 'base32',
                    token: twoFactorToken,
                    window: 1, // Allow a window of 1 step for slight time differences
                });

                if (!isValid) return res.status(401).json({ error: 'Invalid 2FA code' });
            }
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
                message: '2FA enabled successfully. Use this secret to configure your 2FA app.',
                secret: secret.otpauth_url, // Provide URL to be used with a 2FA app
            });
        }
    } catch (error) {
        next(error);
    }
};

// Update Profile Picture
exports.updateProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.profilePicture = req.file.path; // Update profile picture path
        await user.save();

        res.json({ message: 'Profile picture updated successfully', profilePicture: user.profilePicture });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Failed to update profile picture.' });
    }
};
