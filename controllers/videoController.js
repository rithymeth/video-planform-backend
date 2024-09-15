const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Video = require("../models/Video");
const Comment = require("../models/Comment");
const ffmpeg = require('fluent-ffmpeg');

// Helper to generate a thumbnail
const generateThumbnail = (videoPath, thumbnailPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        folder: thumbnailPath,
        size: "320x240",
        filename: "thumbnail.png",
      })
      .on("end", resolve)
      .on("error", reject);
  });
};

// Helper to ensure directory exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/videos");
    ensureDirExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".mp4", ".mov", ".avi"].includes(ext)) {
      return cb(new Error("Only video files are allowed"), false);
    }
    cb(null, true);
  },
});

const uploadVideoFile = upload.single("video");

// Upload Video Controller
const uploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const videoUrl = `uploads/videos/${req.file.filename}`;
    const thumbnailPath = path.join(__dirname, "../uploads/thumbnails");
    ensureDirExists(thumbnailPath);

    await generateThumbnail(req.file.path, thumbnailPath);

    const newVideo = new Video({
      user: req.user.id,
      title,
      description,
      videoUrl,
      thumbnailUrl: `uploads/thumbnails/thumbnail.png`,
    });

    await newVideo.save();
    res.status(201).json({ message: "Video uploaded successfully", videoUrl });
  } catch (error) {
    console.error("Error during video upload:", error);
    res
      .status(500)
      .json({ error: "Failed to upload video. Please try again." });
  }
};

// Stream Video Controller
const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) return res.status(404).json({ error: "Video not found" });

    const videoPath = path.join(__dirname, "..", video.videoUrl);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error("Error streaming video:", error);
    res.status(500).json({ error: "Failed to stream video." });
  }
};

// Generate Embeddable Link
exports.getEmbedCode = (req, res) => {
  const videoId = req.params.id;
  const embedCode = `<iframe width="560" height="315" src="${process.env.FRONTEND_URL}/videos/${videoId}/embed" frameborder="0" allowfullscreen></iframe>`;
  res.json({ embedCode });
};

// Get Video Analytics
exports.getVideoAnalytics = async (req, res) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId)
      .populate("user", "username")
      .populate("comments");

    if (!video) return res.status(404).json({ error: "Video not found" });

    const analyticsData = {
      views: video.views,
      likes: video.likes.length,
      comments: video.comments.length,
    };

    res.json(analyticsData);
  } catch (error) {
    console.error("Error fetching video analytics:", error);
    res.status(500).json({ error: "Failed to fetch video analytics." });
  }
};

// Get Videos Controller
const getVideos = async (req, res) => {
  try {
    const { sortBy, order = "desc", search } = req.query;
    const query = search ? { title: new RegExp(search, "i") } : {};

    const videos = await Video.find(query)
      .sort({ [sortBy || "createdAt"]: order })
      .populate("user", "username")
      .populate("comments");

    res.json({ videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Failed to fetch videos." });
  }
};

// Like Video Controller
const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) return res.status(404).json({ error: "Video not found" });

    if (video.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "Video already liked" });
    }

    video.likes.push(req.user.id);
    await video.save();

    res.json({
      message: "Video liked successfully",
      likes: video.likes.length,
    });
  } catch (error) {
    console.error("Error liking video:", error);
    res.status(500).json({ error: "Failed to like video." });
  }
};

// Comment on Video Controller
const commentOnVideo = async (req, res) => {
  try {
    const { text } = req.body;

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    const newComment = new Comment({
      user: req.user.id,
      video: req.params.id,
      text,
    });

    await newComment.save();

    video.comments.push(newComment._id);
    await video.save();

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error commenting on video:", error);
    res.status(500).json({ error: "Failed to add comment." });
  }
};

// Delete Video Controller
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) return res.status(404).json({ error: "Video not found" });

    if (video.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Unauthorized action" });
    }

    // Delete the video file from the server
    fs.unlink(video.videoUrl, (err) => {
      if (err) console.error("Failed to delete video file:", err);
    });

    await video.remove();

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Failed to delete video." });
  }
};

// Export the upload middleware and controllers
exports.uploadVideoFile = uploadVideoFile;
exports.uploadVideo = uploadVideo;
exports.streamVideo = streamVideo;
exports.getVideos = getVideos;
exports.likeVideo = likeVideo;
exports.commentOnVideo = commentOnVideo;
exports.deleteVideo = deleteVideo;
