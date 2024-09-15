const Video = require('../models/Video');

// Fetch Video Analytics
exports.getVideoAnalytics = async (req, res) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId)
      .populate('user', 'username')
      .populate('comments');

    if (!video) return res.status(404).json({ error: "Video not found" });

    // Calculate analytics data
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
