const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobRole: { type: String, required: true },
    resumeText: { type: String },
    history: [
        {
            role: { type: String, enum: ["user", "model"], required: true },
            parts: [{ text: { type: String, required: true } }]
        }
    ],
    score: { type: Number },
    feedback: { type: String },
    metrics: {
        accuracy: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        problemSolving: { type: Number, default: 0 },
        technicalDepth: { type: Number, default: 0 },
        relevance: { type: Number, default: 0 }
    },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Interview", interviewSchema);
