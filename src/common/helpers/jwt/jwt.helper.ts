import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../../config/env';

type AccessTokenPayload = {
  userId: string;
};

type RefreshTokenPayload = {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
};

export const jwtHelper = {
  createAccessToken(userId: string): string {
    const options: SignOptions = {
      expiresIn: env.accessTokenExpiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign({ userId }, env.accessTokenSecret, options);
  },

  createRefreshToken(userId: string, deviceId: string): string {
    const options: SignOptions = {
      expiresIn: env.refreshTokenExpires as SignOptions['expiresIn'],
    };

    return jwt.sign({ userId, deviceId }, env.refreshTokenSecret, options);
  },

  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      return jwt.verify(token, env.accessTokenSecret) as AccessTokenPayload;
    } catch {
      return null;
    }
  },

  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return jwt.verify(token, env.refreshTokenSecret) as RefreshTokenPayload;
    } catch {
      return null;
    }
  },

  getTokenIssuedAtDate(iat: number): string {
    return new Date(iat * 1000).toISOString();
  },

  getTokenExpirationDate(exp: number): Date {
    return new Date(exp * 1000);
  },
};