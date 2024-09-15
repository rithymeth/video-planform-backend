const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const videoRoutes = require("./routes/videoRoutes");
const feedRoutes = require("./routes/feedRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const logger = require("./utils/logger"); // Import logger for logging
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080/"], // Update this to your production domain(s)
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rate limiting for general requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
app.use(generalLimiter);

// Rate limiting for sensitive actions
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per window
  message: "Too many login attempts from this IP, please try again after 15 minutes",
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 password reset requests per window
  message: "Too many password reset requests from this IP, please try again after 15 minutes",
});

app.use("/api/users/login", loginLimiter);
app.use("/api/users/forgot-password", passwordResetLimiter);

// Routes
app.use('/api/users', userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/feed", feedRoutes);

// Error handling middleware
app.use(errorMiddleware);

// WebSocket Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error("Authentication error"));
      socket.userId = decoded.id; // Store the user ID in the socket instance
      next();
    });
  } else {
    next(new Error("Authentication error"));
  }
});

// WebSocket connection handler
io.on("connection", (socket) => {
  logger.info("A user connected: " + socket.id);

  // Automatically join the user's room based on their ID
  socket.join(socket.userId);
  logger.info(`User ${socket.userId} joined their room.`);

  // Handle disconnect
  socket.on("disconnect", () => {
    logger.info("User disconnected: " + socket.id);
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("MongoDB connected"))
  .catch((err) => logger.error("MongoDB connection error:", err));

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("Shutting down gracefully...");
  server.close(() => {
    logger.info("Closed out remaining connections.");
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed.");
      process.exit(0);
    });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

// Export the io instance for use in other modules
module.exports.io = io;
