import { NextFunction, Request, Response } from 'express';

type AttemptInfo = {
  ip: string;
  url: string;
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

export const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const now = Date.now();
  const ip = getClientIp(req);
  const url = req.originalUrl;

  for (let i = attempts.length - 1; i >= 0; i--) {
    if (now - attempts[i].date > WINDOW_MS) {
      attempts.splice(i, 1);
    }
  }

  const currentAttempts = attempts.filter(
    (attempt) => attempt.ip === ip && attempt.url === url,
  );

  if (currentAttempts.length >= LIMIT) {
    res.sendStatus(429);
    return;
  }

  attempts.push({
    ip,
    url,
    date: now,
  });

  next();
};