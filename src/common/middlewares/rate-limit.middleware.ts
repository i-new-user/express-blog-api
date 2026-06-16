import { NextFunction, Request, Response } from 'express';

type AttemptInfo = {
  ip: string;
  endpoint: string;
  date: number;
};

const attempts: AttemptInfo[] = [];

const LIMIT = 5;
const WINDOW_MS = 10 * 1000;

const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || 'unknown';
};

const normalizeEndpoint = (url: string): string => {
  return url.replace(/^\/hometask_\d+\/api/, '').split('?')[0];
};

export const clearRateLimitAttempts = (): void => {
  attempts.length = 0;
};

export const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const now = Date.now();
  const ip = getClientIp(req);
  const endpoint = normalizeEndpoint(req.originalUrl);

  for (let i = attempts.length - 1; i >= 0; i--) {
    if (now - attempts[i].date > WINDOW_MS) {
      attempts.splice(i, 1);
    }
  }

  const currentAttempts = attempts.filter(
    (attempt) => attempt.ip === ip && attempt.endpoint === endpoint,
  );

  if (currentAttempts.length >= LIMIT) {
    res.sendStatus(429);
    return;
  }

  attempts.push({
    ip,
    endpoint,
    date: now,
  });

  next();
};