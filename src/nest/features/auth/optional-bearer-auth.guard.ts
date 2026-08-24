import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenService } from './jwt-token.service';

export type OptionalAuthenticatedRequest = Request & { userId?: string };

@Injectable()
export class OptionalBearerAuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<OptionalAuthenticatedRequest>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type === 'Bearer' && token) {
      const payload = this.jwtTokenService.verifyAccessToken(token);
      if (payload) request.userId = payload.userId;
    }

    return true;
  }
}
