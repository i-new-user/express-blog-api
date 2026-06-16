import { NextFunction, Request, Response } from 'express';
import { jwtHelper } from '../../../common/helpers/jwt/jwt.helper';

export const refreshTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.sendStatus(401);
    return;
  }

  const payload = jwtHelper.verifyRefreshToken(refreshToken);

  if (!payload) {
    res.sendStatus(401);
    return;
  }

  req.userId = payload.userId;
  req.deviceId = payload.deviceId;
  req.tokenIssuedAt = jwtHelper.getTokenIssuedAtDate(payload.iat);

  next();
};