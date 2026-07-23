import { Injectable } from '@nestjs/common';
import jwt, { SignOptions } from 'jsonwebtoken';
import { appConfig } from '../../config/app.config';

export type AccessTokenPayload = {
  userId: string;
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
