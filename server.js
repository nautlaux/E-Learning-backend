require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { startAnalyticsCron } = require('./jobs/analyticsCron');

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    await connectDB();
    startAnalyticsCron();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

