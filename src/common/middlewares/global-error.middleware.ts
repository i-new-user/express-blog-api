import { NextFunction, Request, Response } from 'express';
import { env } from '../../config/env';

export const globalErrorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('Unhandled application error:', error);

  res.status(500).json({
    message: 'Internal server error',
    ...(env.isProduction ? {} : { error }),
  });
};