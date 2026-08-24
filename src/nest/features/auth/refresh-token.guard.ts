import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenService } from './jwt-token.service';
import { SecurityDevicesRepository } from '../security/security-devices.repository';

export type RefreshAuthenticatedRequest = Request & { userId: string; deviceId: string; tokenIssuedAt: string };
@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly jwt: JwtTokenService, private readonly devices: SecurityDevicesRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RefreshAuthenticatedRequest>();
    const token = request.cookies?.refreshToken as string | undefined;
    if (!token) throw new UnauthorizedException();
    const payload = this.jwt.verifyRefreshToken(token);
    if (!payload) throw new UnauthorizedException();
    request.userId = payload.userId;
    request.deviceId = payload.deviceId;
    request.tokenIssuedAt = new Date(payload.iat * 1000).toISOString();
    const device = await this.devices.findCurrent(request.deviceId, request.tokenIssuedAt);
    if (!device || device.userId !== request.userId) throw new UnauthorizedException();
    return true;
  }
}
