const mongoose = require('mongoose');

const connectDB = async (uri = process.env.MONGODB_URI) => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      autoIndex: true,
    });
    // Connection ready
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

module.exports = connectDB;

