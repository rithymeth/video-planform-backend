const User = require("../models/User");
const Video = require("../models/Video");

// Function to get user by ID
exports.getUser = async (id) => {
  try {
    const user = await User.findById(id).select("-password");
    return user;
  } catch (error) {
    throw new Error("Error fetching user data");
  }
};

// Function to get all videos
exports.getVideo = async () => {
  try {
    const videos = await Video.find();
    return videos;
  } catch (error) {
    throw new Error("Error fetching video data");
  }
};
