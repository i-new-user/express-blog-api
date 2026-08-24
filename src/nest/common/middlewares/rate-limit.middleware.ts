import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
type Attempt = { ip: string; endpoint: string; time: number };
const attempts: Attempt[] = [];
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || 'unknown';
    const endpoint = req.originalUrl.split('?')[0];
    for (let i = attempts.length - 1; i >= 0; i--) if (now - attempts[i].time >= 10_000) attempts.splice(i, 1);
    if (attempts.filter((a) => a.ip === ip && a.endpoint === endpoint).length >= 5) return res.sendStatus(429);
    attempts.push({ ip, endpoint, time: now });
    next();
  }
}
