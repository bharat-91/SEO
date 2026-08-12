import { Request, Response, NextFunction } from 'express';
import { getLogger } from '../utils/logger.js';

export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const logger = getLogger();
  const start = Date.now();

  const originalSend = res.send;

  res.send = function (data: unknown): Response {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    logger.info(`${req.method} ${req.path}`, {
      statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
    });

    res.send = originalSend;
    return res.send(data);
  };

  next();
}
