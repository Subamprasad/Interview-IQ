const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/InterviewIQ";

  try {
    console.log("[DATABASE] Attempting neural uplink to MongoDB Cluster...");
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    console.log("[DATABASE] Uplink confirmed with MongoDB Cluster.");
  } catch (error) {
    console.warn("[DATABASE-WARNING] Neural link failed. Activating Resilient Local/Memory Mode.");

    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/InterviewIQ_Local", {
        serverSelectionTimeoutMS: 2000
      });
      console.log("[DATABASE] Secondary Local Link established.");
    } catch (localError) {
      console.error("[DATABASE-CRITICAL] All database links are offline. Operating in Resilient Mock Layer.");
    }
  }
};

module.exports = connectDB;
