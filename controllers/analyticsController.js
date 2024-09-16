const Video = require("../models/Video");
const User = require("../models/User");

// Get analytics for a specific video
exports.getVideoAnalytics = async (req, res, next) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Perform necessary calculations for analytics
    const analytics = {
      views: video.views,
      likes: video.likes,
      comments: video.comments.length,
      // Add any other analytics you want to provide
    };

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

// Get analytics for a specific user
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Perform necessary calculations for analytics
    const analytics = {
      uploadedVideos: user.uploadedVideos.length,
      totalViews: user.uploadedVideos.reduce(
        (acc, video) => acc + video.views,
        0
      ),
      // Add any other analytics you want to provide
    };

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

// Get overall platform analytics
exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    // Perform necessary calculations for platform-wide analytics
    const totalUsers = await User.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalViews = await Video.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);

    const analytics = {
      totalUsers,
      totalVideos,
      totalViews: totalViews[0]?.totalViews || 0,
      // Add any other analytics you want to provide
    };

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};
