export abstract class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: unknown
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Fix prototype chain (important in TS)
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

/* 400 */
export class ValidationError extends BaseError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 400, true, details);
  }
}

/* 401 */
export class AuthError extends BaseError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/* 403 */
export class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden access') {
    super(message, 403);
  }
}

/* 404 */
export class NotFoundError extends BaseError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/* 409 */
export class ConflictError extends BaseError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/* 500 */
export class ServerError extends BaseError {
  constructor(message = 'Database error', details?: unknown) {
    super(message, 500, false, details);
  }
}

/* 429 */
export class RateLimitError extends BaseError {
  constructor(message = 'Too many requests, please try again later.') {
    super(message, 429);
  }
}
