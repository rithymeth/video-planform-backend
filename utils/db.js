// utils/db.js

const mongoose = require("mongoose");
const logger = require("./logger"); // Ensure you have a logger utility
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Removed deprecated options: useNewUrlParser and useUnifiedTopology
      maxPoolSize: 10, // Adjust based on your needs
      // You can add other options here as needed
    });
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
