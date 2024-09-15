const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: 'default-profile.png',
    },
    bio: {
        type: String,
        maxLength: 250, // Maximum length for the bio
    },
    coverPhoto: {
        type: String,
    },
    socialLinks: {
        facebook: { type: String },
        twitter: { type: String },
        instagram: { type: String },
        linkedin: { type: String }
    },
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    emailVerificationToken: {
        type: String,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorSecret: {
        type: String,
    },
}, { timestamps: true });

// Add a text index to the username and email fields for efficient searching
userSchema.index({ username: 'text', email: 'text' });

const User = mongoose.model('User', userSchema);
module.exports = User;
