const Video = require('../models/Video');
const User = require('../models/User');

// Get User's Feed
exports.getUserFeed = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('following');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const following = user.following.map(follow => follow._id);
        following.push(req.user.id); // Include user's own videos

        const videos = await Video.find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .populate('user', 'username')
            .populate('comments');

        res.json({ feed: videos });
    } catch (error) {
        next(error);
    }
};
