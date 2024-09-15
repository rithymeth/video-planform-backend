const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    views: { type: Number, default: 0 },
    watchTime: { type: Number, default: 0 }, // Total watch time in seconds
    retentionRate: { type: Number, default: 0 }, // Retention rate percentage
    locationData: [{ country: String, count: Number }], // Location data
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
