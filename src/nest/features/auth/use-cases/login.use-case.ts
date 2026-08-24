import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { UsersRepository } from '../../users/users.repository';
import { LoginDto } from '../dto/auth.dto';
import { JwtTokenService } from '../jwt-token.service';
import { v4 as uuidv4 } from 'uuid';
import { SecurityDevicesRepository } from '../../security/security-devices.repository';

export class LoginCommand { constructor(public readonly dto: LoginDto, public readonly ip: string, public readonly title: string) {} }

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(private readonly users: UsersRepository, private readonly jwt: JwtTokenService, private readonly devices: SecurityDevicesRepository) {}
  async execute({ dto, ip, title }: LoginCommand): Promise<{ accessToken: string; refreshToken: string } | null> {
    const user = await this.users.findByLoginOrEmail(dto.loginOrEmail);
    if (!user || !user.emailConfirmation.isConfirmed || !(await bcrypt.compare(dto.password, user.passwordHash))) return null;
    const deviceId = uuidv4();
    const refreshToken = this.jwt.createRefreshToken(user._id.toString(), deviceId);
    const payload = this.jwt.verifyRefreshToken(refreshToken)!;
    await this.devices.create({ userId: user._id.toString(), deviceId, ip, title, lastActiveDate: new Date(payload.iat * 1000).toISOString(), expiresAt: new Date(payload.exp * 1000) });
    return {
      accessToken: this.jwt.createAccessToken(user._id.toString()),
      refreshToken,
    };
  }
}
