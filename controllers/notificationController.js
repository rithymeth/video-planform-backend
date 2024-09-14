const Notification = require('../models/Notification');
const io = require('../app').io; // Import the socket.io instance

// Create Notification
exports.createNotification = async (type, userId, fromUserId, content) => {
  try {
    const newNotification = new Notification({ type, user: userId, fromUser: fromUserId, content });
    await newNotification.save();

    // Emit the notification to the specific user room
    io.to(userId).emit('newNotification', newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
