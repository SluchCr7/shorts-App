const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  try {
    console.log(`[MongoDB] Connecting to database...`);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Primary connection attempt failed: ${error.message}`);
    try {
      console.log(`[MongoDB] Attempting fallback to local MongoDB instance...`);
      const fallbackConn = await mongoose.connect("mongodb://127.0.0.1:27017/video_shorts", {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[MongoDB] Local fallback connected: ${fallbackConn.connection.host}`);
      return fallbackConn;
    } catch (fallbackErr) {
      console.error(
        `[MongoDB] Could not establish connection to MongoDB (${fallbackErr.message}). Ensure MongoDB service is running or check MONGODB_URI in .env`
      );
      throw error;
    }
  }
};

module.exports = connectDB;
