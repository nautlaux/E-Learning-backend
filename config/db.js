const mongoose = require('mongoose');

const connectDB = async (uri = process.env.MONGODB_URI || 'mongodb+srv://industriesgoraksh:Unlucky%4097@allpricess-cluster.aluqd.mongodb.net/Courses') => {
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

