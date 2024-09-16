const Video = require("../models/Video");

// Approve a video
exports.approveVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    video.status = "approved";
    await video.save();
    res.json({ message: "Video approved successfully" });
  } catch (error) {
    console.error("Error approving video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reject a video
exports.rejectVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    video.status = "rejected";
    await video.save();
    res.json({ message: "Video rejected successfully" });
  } catch (error) {
    console.error("Error rejecting video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
