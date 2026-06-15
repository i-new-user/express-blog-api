import { Request, Response, NextFunction } from 'express';
import { jwtHelper } from '../../../common/helpers/jwt/jwt.helper';

export const bearerAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.sendStatus(401);
    return;
  }

  const [authType, token] = authHeader.split(' ');

  if (authType !== 'Bearer' || !token) {
    res.sendStatus(401);
    return;
  }

  const payload = jwtHelper.verifyAccessToken(token);

  if (!payload) {
    res.sendStatus(401);
    return;
  }

  req.userId = payload.userId;

  next();
};