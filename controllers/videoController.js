const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video'); // Mongoose model for videos
const Comment = require('../models/Comment'); // Mongoose model for comments

// Helper function to ensure the directory exists
const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true }); // Creates the directory and any necessary subdirectories
    }
};

// Configure multer for video uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/videos'); // Set the folder for storing uploaded videos
        ensureDirExists(dir); // Ensure the directory exists before storing files
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Rename the file to prevent conflicts
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // Set file size limit to 500 MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.mp4', '.mov', '.avi'].includes(ext)) {
            return cb(new Error('Only video files are allowed'), false);
        }
        cb(null, true);
    }
});

// Middleware to handle video uploads
const uploadVideoFile = upload.single('video');

// Upload Video Controller
exports.uploadVideo = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }
        const videoUrl = req.file.path; // Get the path of the uploaded file

        // Save video metadata to the database
        const newVideo = new Video({ user: req.user.id, title, description, videoUrl });
        await newVideo.save();

        res.status(201).json({ message: 'Video uploaded successfully', videoUrl });
    } catch (error) {
        console.error('Error during video upload:', error);
        res.status(500).json({ error: 'Failed to upload video. Please try again.' });
    }
};

// Get Videos Controller
exports.getVideos = async (req, res) => {
    try {
        const videos = await Video.find().populate('user', 'username').populate('comments');
        res.json({ videos });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos.' });
    }
};

// Like Video Controller
exports.likeVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) return res.status(404).json({ error: 'Video not found' });

        if (video.likes.includes(req.user.id)) {
            return res.status(400).json({ message: 'Video already liked' });
        }

        video.likes.push(req.user.id);
        await video.save();

        res.json({ message: 'Video liked successfully', likes: video.likes.length });
    } catch (error) {
        console.error('Error liking video:', error);
        res.status(500).json({ error: 'Failed to like video.' });
    }
};

// Comment on Video Controller
exports.commentOnVideo = async (req, res) => {
    try {
        const { text } = req.body;

        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ error: 'Video not found' });

        const newComment = new Comment({
            user: req.user.id,
            video: req.params.id,
            text,
        });

        await newComment.save();

        video.comments.push(newComment._id);
        await video.save();

        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        console.error('Error commenting on video:', error);
        res.status(500).json({ error: 'Failed to add comment.' });
    }
};

// Delete Video Controller
exports.deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) return res.status(404).json({ error: 'Video not found' });

        if (video.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'Unauthorized action' });
        }

        // Delete the video file from the server
        fs.unlink(video.videoUrl, (err) => {
            if (err) console.error('Failed to delete video file:', err);
        });

        await video.remove();

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video.' });
    }
};

// Export the upload middleware
exports.uploadVideoFile = uploadVideoFile;
