const Notification = require('../models/Notification');

// Create Notification
exports.createNotification = async (type, userId, fromUserId, content) => {
  try {
    const newNotification = new Notification({ type, user: userId, fromUser: fromUserId, content });
    await newNotification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Get User Notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id, isRead: false })
      .populate('fromUser', 'username profilePicture')
      .sort('-createdAt');

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

// Mark Notification as Read
exports.markNotificationAsRead = async (req, res) => {
  try {
    await Notification.updateOne({ _id: req.params.id, user: req.user.id }, { isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
};
