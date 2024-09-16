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
const logger = require("./utils/logger");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const Redis = require("ioredis");
const redisClient = new Redis(); // Redis client for caching

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware configuration
app.use(express.json());
app.use(
  cookieParser(process.env.COOKIE_SECRET, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  })
);
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger API Documentation
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Media Platform API",
      version: "1.0.0",
      description: "API documentation for the Media Platform",
    },
  },
  apis: ["./routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again later.",
});
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many password reset requests. Please try again later.",
});
app.use("/api/users/login", loginLimiter);
app.use("/api/users/forgot-password", passwordResetLimiter);

// Health Check Endpoint
app.get("/health", (req, res) => {
  const redisStatus =
    redisClient.status === "ready" ? "connected" : "disconnected";
  const mongoStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    services: {
      redis: redisStatus,
      mongoDB: mongoStatus,
    },
  });
});

// Routes
app.use("/api/users", userRoutes);
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
      socket.userId = decoded.id;
      next();
    });
  } else {
    next(new Error("Authentication error"));
  }
});

// WebSocket connection handler
io.on("connection", (socket) => {
  console.log("A user connected");

  // Real-time notification system example
  socket.on("likeVideo", (data) => {
    io.emit("notification", { message: `User liked a video: ${data.videoId}` });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Redis Caching Middleware
redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
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

module.exports.io = io;
