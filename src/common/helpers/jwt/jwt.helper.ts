import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';

type AccessTokenPayload = {
  userId: string;
};

/**
 * JwtHelper — отдельный helper для работы с accessToken.
 *
 * Почему не пишем jwt.sign прямо в auth.service?
 * Потому что позже добавятся:
 * - refreshToken
 * - device sessions
 * - expiration
 * - email confirmation
 *
 * И всё это удобнее держать отдельно.
 */
export const jwtHelper = {
  createAccessToken(userId: string): string {
    const payload: AccessTokenPayload = {
      userId,
    };

    return jwt.sign(payload, env.accessTokenSecret, {
      expiresIn: '10m',
    });
  },

  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      return jwt.verify(token, env.accessTokenSecret) as AccessTokenPayload;
    } catch {
      return null;
    }
  },
};