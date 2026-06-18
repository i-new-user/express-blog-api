import { Request, Response, NextFunction } from 'express';
import { jwtHelper } from '../../../common/helpers/jwt/jwt.helper';

export const optionalBearerAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  const [authType, token] = authHeader.split(' ');

  if (authType !== 'Bearer' || !token) {
    next();
    return;
  }

  const payload = jwtHelper.verifyAccessToken(token);

  if (payload) {
    req.userId = payload.userId;
  }

  next();
};