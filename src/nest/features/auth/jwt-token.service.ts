import { Injectable } from '@nestjs/common';
import jwt, { SignOptions } from 'jsonwebtoken';
import { appConfig } from '../../config/app.config';

export type AccessTokenPayload = {
  userId: string;
};

export type RefreshTokenPayload = AccessTokenPayload & {
  deviceId: string;
  iat: number;
  exp: number;
};

@Injectable()
export class JwtTokenService {
  createAccessToken(userId: string): string {
    const options: SignOptions = {
      expiresIn:
        appConfig.accessTokenExpiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign({ userId }, appConfig.accessTokenSecret, options);
  }

  createRefreshToken(userId: string, deviceId: string): string {
    const options: SignOptions = { expiresIn: appConfig.refreshTokenExpiresIn as SignOptions['expiresIn'] };
    return jwt.sign(
      { userId, deviceId, tokenType: 'refresh' },
      appConfig.accessTokenSecret,
      options,
    );
  }

  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return jwt.verify(token, appConfig.accessTokenSecret) as RefreshTokenPayload;
    } catch {
      return null;
    }
  }

  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      return jwt.verify(
        token,
        appConfig.accessTokenSecret,
      ) as AccessTokenPayload;
    } catch {
      return null;
    }
  }
}
