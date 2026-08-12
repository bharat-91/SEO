import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { getLogger } from '../utils/logger.js';
import { getConfig } from '../config/index.js';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const logger = getLogger();
  const config = getConfig();

  if (error instanceof AppError) {
    const response: ErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
      },
    };

    // Log error details server-side
    logger.error(`AppError: ${error.code}`, {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    });

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle unexpected errors
  const statusCode = (error as any)?.statusCode || 500;
  const errorCode = 'INTERNAL_ERROR';
  const message =
    config.NODE_ENV === 'production'
      ? 'Internal server error.'
      : (error instanceof Error ? error.message : String(error));

  logger.error('Unhandled error', {
    message,
    stack: error instanceof Error ? error.stack : undefined,
  });

  const response: ErrorResponse = {
    error: {
      code: errorCode,
      message,
    },
  };

  res.status(statusCode).json(response);
}

export function notFoundHandler(_req: Request, res: Response): void {
  const response: ErrorResponse = {
    error: {
      code: 'NOT_FOUND',
      message: 'Not found.',
    },
  };
  res.status(404).json(response);
}
