// mongo.js
require("dotenv").config();
const mongoose = require("mongoose");

async function connectWithRetry({
  maxRetries = 10,
  retryDelay = 2000, // initial delay in ms
} = {}) {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGO_URI is missing in .env file");
    process.exit(1);
  }

  let attempts = 0;

  async function connect() {
    try {
      attempts++;
      console.log(`🔌 MongoDB: Attempt ${attempts} to connect...`);

      await mongoose.connect(uri, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });

      console.log("✅ MongoDB connected successfully!");
      return;

    } catch (error) {
      console.error("❌ MongoDB connection error:", error.message);

      if (attempts >= maxRetries) {
        console.error("🚨 Max retries reached. Exiting...");
        process.exit(1);
      }

      const delay = retryDelay * attempts; // exponential backoff
      console.log(`⏳ Retrying in ${delay / 1000}s...\n`);

      await new Promise((r) => setTimeout(r, delay));

      return connect();
    }
  }

  return connect();
}

module.exports = connectWithRetry;
