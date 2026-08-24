import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { UsersRepository } from '../../users/users.repository';
import { LoginDto } from '../dto/auth.dto';
import { JwtTokenService } from '../jwt-token.service';

export class LoginCommand {
  constructor(public readonly dto: LoginDto) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase
  implements ICommandHandler<LoginCommand>
{
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtTokenService,
  ) {}

  async execute(
    { dto }: LoginCommand,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const user = await this.users.findByLoginOrEmail(
      dto.loginOrEmail,
    );

    if (
      !user ||
      !user.emailConfirmation.isConfirmed ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      return null;
    }

    return {
      accessToken: this.jwt.createAccessToken(
        user._id.toString(),
      ),
      refreshToken: this.jwt.createRefreshToken(
        user._id.toString(),
      ),
    };
  }
}