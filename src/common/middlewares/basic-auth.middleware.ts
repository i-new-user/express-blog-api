import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';

export const basicAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.sendStatus(401);
    return;
  }

  const [authType, encodedCredentials] = authHeader.split(' ');

  if (authType !== 'Basic' || !encodedCredentials) {
    res.sendStatus(401);
    return;
  }

  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString(
    'utf-8',
  );

  const separatorIndex = decodedCredentials.indexOf(':');

  if (separatorIndex === -1) {
    res.sendStatus(401);
    return;
  }

  const login = decodedCredentials.slice(0, separatorIndex);
  const password = decodedCredentials.slice(separatorIndex + 1);

  if (login !== env.adminLogin || password !== env.adminPassword) {
    res.sendStatus(401);
    return;
  }

  next();
};