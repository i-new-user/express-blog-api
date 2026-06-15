import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../../config/env';

type AccessTokenPayload = {
  userId: string;
};

export const jwtHelper = {
  createAccessToken(userId: string): string {
    const payload: AccessTokenPayload = { userId };

    const options: SignOptions = {
      expiresIn: env.accessTokenExpiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, env.accessTokenSecret, options);
  },

  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      return jwt.verify(token, env.accessTokenSecret) as AccessTokenPayload;
    } catch {
      return null;
    }
  },
};