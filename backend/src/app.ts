import express, { Express } from 'express';
import { requestLoggingMiddleware } from './middleware/logging.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

export function createApp(): Express {
  const app = express();

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(requestLoggingMiddleware);

  // CORS — intentionally open to every origin so the frontend can be hosted
  // anywhere (local dev, Docker, Render, a static host) without reconfiguring
  // the API.
  //
  // Safe here because this is a public, unauthenticated API: it uses no
  // cookies, sessions or Authorization headers, so a wildcard origin grants a
  // browser nothing it could not already get by calling the API directly.
  // Credentials are deliberately NOT enabled — `Allow-Credentials: true`
  // combined with `*` is rejected by browsers and would genuinely be unsafe.
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Routes
  app.use('/', routes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
