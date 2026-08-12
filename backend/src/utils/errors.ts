export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super('NOT_FOUND', message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 400);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class InternalError extends AppError {
  constructor(message: string, details?: unknown) {
    super('INTERNAL_ERROR', message, 500, details);
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}
