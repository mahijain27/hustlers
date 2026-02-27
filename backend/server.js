import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import logger from './utils/logger.js';

// Initialize Database connection
connectDB();

const PORT = env.port;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${env.nodeEnv} mode on port ${PORT}`);
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process securely
  server.close(() => process.exit(1));
});
