import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors.js';

function formatZodError(error: ZodError) {
  return error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }));
}

function toValidationError(error: unknown, part: string): ValidationError {
  if (error instanceof ZodError) {
    return new ValidationError(`Request ${part} validation failed`, formatZodError(error));
  }
  return new ValidationError(`Request ${part} validation failed`);
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(toValidationError(error, 'body'));
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      next(toValidationError(error, 'params'));
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      Object.assign(req.query, schema.parse(req.query));
      next();
    } catch (error) {
      next(toValidationError(error, 'query'));
    }
  };
}
