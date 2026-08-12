import { loadConfig } from './config/index.js';
import { initializeLogger } from './utils/logger.js';
import { initializeHttpClient } from './utils/httpClient.js';
import { connectDatabase } from './config/database.js';
import { createApp } from './app.js';

async function main() {
  try {
    // Load configuration
    const config = loadConfig();
    const logger = initializeLogger();

    logger.info('Loading configuration...');

    // Initialize HTTP client
    initializeHttpClient();
    logger.info('HTTP client initialized');

    // Connect to MongoDB
    await connectDatabase();
    logger.info('MongoDB connected');

    // Create Express app
    const app = createApp();
    logger.info('Express app created');

    // Start server
    const PORT = config.PORT;

    const server = app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully...');
      server.close(async () => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
