import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenService } from './jwt-token.service';

export type AuthenticatedRequest = Request & {
  userId: string;
};

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException();
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }

    const payload = this.jwtTokenService.verifyAccessToken(token);

    if (!payload) {
      throw new UnauthorizedException();
    }

    request.userId = payload.userId;
    return true;
  }
}
