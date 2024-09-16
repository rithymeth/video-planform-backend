const User = require("../models/User");
const Video = require("../models/Video");
const Report = require("../models/Report");

// Get all flagged content
exports.getFlaggedContent = async (req, res, next) => {
  try {
    const flaggedVideos = await Video.find({ isFlagged: true });
    res.json({ flaggedVideos });
  } catch (error) {
    next(error);
  }
};

// Review flagged content
exports.reviewFlaggedContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // Action could be 'approve' or 'remove'

    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    if (action === "approve") {
      video.isFlagged = false;
      await video.save();
      res.json({ message: "Video approved successfully" });
    } else if (action === "remove") {
      await video.remove();
      res.json({ message: "Video removed successfully" });
    } else {
      res.status(400).json({ error: "Invalid action specified" });
    }
  } catch (error) {
    next(error);
  }
};

// Ban a user by ID
exports.banUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isBanned = true;
    await user.save();

    res.json({ message: "User banned successfully" });
  } catch (error) {
    next(error);
  }
};

// Unban a user by ID
exports.unbanUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isBanned = false;
    await user.save();

    res.json({ message: "User unbanned successfully" });
  } catch (error) {
    next(error);
  }
};

// Get all user reports
exports.getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find({});
    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

// Resolve a user report
exports.resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    report.status = "resolved";
    await report.save();

    res.json({ message: "Report resolved successfully" });
  } catch (error) {
    next(error);
  }
};
