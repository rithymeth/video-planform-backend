const Video = require("../models/Video");
const User = require("../models/User");

// Get analytics for admin
exports.getAnalytics = async (req, res) => {
  try {
    const mostLikedVideos = await Video.find().sort({ likes: -1 }).limit(5);
    const mostActiveUsers = await User.find()
      .sort({ activityScore: -1 })
      .limit(5);

    res.json({
      mostLikedVideos,
      mostActiveUsers,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
