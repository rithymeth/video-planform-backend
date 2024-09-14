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

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: 'http://127.0.0.1:5500/index.html', // or the specific frontend URL you are using
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/feed", feedRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
