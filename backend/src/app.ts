import express, { Express } from 'express';
import { getConfig } from './config/index.js';
import { requestLoggingMiddleware } from './middleware/logging.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

export function createApp(): Express {
  const app = express();
  const config = getConfig();

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(requestLoggingMiddleware);

  // CORS (simple setup for local development)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.FRONTEND_URL);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Routes
  app.use('/', routes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
