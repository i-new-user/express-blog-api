import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../security/security-devices.repository';
import { JwtTokenService } from '../jwt-token.service';
export class RefreshSessionCommand { constructor(public userId: string, public deviceId: string, public issuedAt: string) {} }
export class LogoutCommand { constructor(public userId: string, public deviceId: string, public issuedAt: string) {} }
@CommandHandler(RefreshSessionCommand)
export class RefreshSessionUseCase implements ICommandHandler<RefreshSessionCommand> {
  constructor(private readonly devices: SecurityDevicesRepository, private readonly jwt: JwtTokenService) {}
  async execute(c: RefreshSessionCommand) {
    const device = await this.devices.findCurrent(c.deviceId, c.issuedAt);
    if (!device || device.userId !== c.userId) return null;
    const refreshToken = this.jwt.createRefreshToken(c.userId, c.deviceId);
    const payload = this.jwt.verifyRefreshToken(refreshToken)!;
    const lastActiveDate = new Date(payload.iat * 1000).toISOString();
    if (!(await this.devices.rotate(c.deviceId, c.issuedAt, lastActiveDate, new Date(payload.exp * 1000)))) return null;
    return { accessToken: this.jwt.createAccessToken(c.userId), refreshToken };
  }
}
@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private readonly devices: SecurityDevicesRepository) {}
  async execute(c: LogoutCommand) {
    const device = await this.devices.findCurrent(c.deviceId, c.issuedAt);
    if (!device || device.userId !== c.userId) return false;
    await this.devices.deleteOne(c.deviceId);
    return true;
  }
}
export const SESSION_COMMAND_HANDLERS = [RefreshSessionUseCase, LogoutUseCase];
