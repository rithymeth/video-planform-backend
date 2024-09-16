const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const Redis = require("ioredis");
const { connectRabbitMQ } = require("./utils/rabbitMQ");
const logger = require("./utils/logger");
const errorMiddleware = require("./middleware/errorMiddleware");
const monitoringMiddleware = require("./middleware/monitoringMiddleware");

// Import Routes
const userRoutes = require("./routes/userRoutes");
const videoRoutes = require("./routes/videoRoutes");
const feedRoutes = require("./routes/feedRoutes");
const searchRoutes = require("./routes/searchRoutes");
const moderationRoutes = require("./routes/moderationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

// Import Database Connection
const connectDB = require("./utils/db");

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Connect to MongoDB
connectDB();

// Initialize Redis Client
const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
); // Update REDIS_URL if needed

// Middleware Configuration
app.use(express.json());
app.use(
  cookieParser(process.env.COOKIE_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Ensure cookies are secure in production
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
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
  },
  apis: ["./routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes.",
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
app.use(generalLimiter);

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
app.use("/api/search", searchRoutes);
app.use("/api/moderate", moderationRoutes);
app.use("/api/analytics", analyticsRoutes);

// Monitoring Endpoint
app.get("/metrics", monitoringMiddleware); // Ensure this is a middleware function

// Error Handling Middleware
app.use(errorMiddleware); // Ensure this is a middleware function

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

// WebSocket Connection Handler
io.on("connection", (socket) => {
  logger.info("A user connected");

  // Example Real-time Notification
  socket.on("likeVideo", (data) => {
    io.emit("notification", { message: `User liked a video: ${data.videoId}` });
  });

  socket.on("disconnect", () => {
    logger.info("User disconnected");
  });
});

// Redis Caching Middleware
redisClient.on("error", (err) => {
  logger.error("Redis connection error:", err);
});

// Connect to RabbitMQ
connectRabbitMQ();

// Graceful Shutdown
process.on("SIGINT", () => {
  logger.info("Shutting down gracefully...");
  server.close(() => {
    logger.info("Closed out remaining connections.");
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed.");
      redisClient.quit(() => {
        logger.info("Redis connection closed.");
        process.exit(0);
      });
    });
  });
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

module.exports.io = io;
