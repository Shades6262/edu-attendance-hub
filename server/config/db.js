const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retryCount = 0) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // fail faster instead of hanging forever
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error(`MongoDB connection error (attempt ${retryCount + 1}):`, err.message);

    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(() => connectDB(retryCount + 1), RETRY_DELAY_MS);
    } else {
      console.error('Max retries reached. Could not connect to MongoDB.');
      process.exit(1);
    }
  }
};

// log unexpected disconnects/reconnects after initial connection too
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error event:', err.message);
});

module.exports = connectDB;