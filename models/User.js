const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
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
      default: "default-profile.png",
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
      linkedin: { type: String },
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role", // Referencing Role model for dynamic roles management
      },
    ],
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission", // Referencing Permission model for granular access control
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification", // Referencing a Notification model for user notifications
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "banned"], // Different status options for user accounts
      default: "active",
    },
  },
  { timestamps: true }
);

// Add a text index to the username, email, and bio fields for efficient searching
userSchema.index({ username: "text", email: "text", bio: "text" });

// Virtual for getting the full name (if you ever add 'firstName' and 'lastName' fields)
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash the password if it has been modified

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ToJSON method to hide sensitive information
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.twoFactorSecret;
  delete user.emailVerificationToken;
  delete user.resetPasswordToken;
  return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
