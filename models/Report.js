// models/Report.js

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reportedContentId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "contentType",
    required: true,
  },
  contentType: {
    type: String,
    enum: ["Video", "Comment"], // Example types of content that can be reported
    required: true,
  },
  reason: {
    type: String,
    enum: ["spam", "abuse", "other"], // Example reasons for reporting
    required: true,
  },
  details: {
    type: String,
    maxLength: 500,
  },
  status: {
    type: String,
    enum: ["pending", "resolved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
