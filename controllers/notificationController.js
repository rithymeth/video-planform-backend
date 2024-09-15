const Notification = require('../models/Notification');
const io = require('../app').io; // Import the Socket.io instance

// Create Notification with Real-Time Push
exports.createNotification = async (type, userId, fromUserId, content) => {
  try {
    const newNotification = new Notification({ type, user: userId, fromUser: fromUserId, content });
    await newNotification.save();

    // Emit the notification to the specific user's room
    io.to(userId).emit('newNotification', newNotification); // Real-time push

    return newNotification; // Return the new notification
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
