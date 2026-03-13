import { Request, Response, NextFunction } from 'express';
import { BaseError } from './index';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Known (expected) errors
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details ?? null,
    });
  }

  // Unknown / programming errors
  console.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    message: 'Something went wrong',
  });
}
