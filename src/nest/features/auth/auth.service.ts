import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { appConfig } from '../../config/app.config';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import {
  LoginDto,
  NewPasswordDto,
  RegistrationDto,
} from './dto/auth.dto';
import { EmailService } from './email.service';
import { JwtTokenService } from './jwt-token.service';

export type LoginResult = {
  accessToken: string;
};

export type MeView = {
  email: string;
  login: string;
  userId: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly jwtTokenService: JwtTokenService,
    private readonly emailService: EmailService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResult | null> {
    const user = await this.usersRepository.findByLoginOrEmail(
      dto.loginOrEmail,
    );

    if (!user || !user.emailConfirmation.isConfirmed) {
      return null;
    }

    const isPasswordCorrect = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordCorrect) {
      return null;
    }

    return {
      accessToken: this.jwtTokenService.createAccessToken(
        user._id.toString(),
      ),
    };
  }

  async getMe(userId: string): Promise<MeView | null> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return null;
    }

    return {
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
    };
  }

  async register(dto: RegistrationDto): Promise<void> {
    const user = await this.usersService.createForRegistration(dto);

    await this.emailService.sendRegistrationEmail(
      user.email,
      user.emailConfirmation.confirmationCode,
    );
  }

  async confirmRegistration(code: string): Promise<boolean> {
    const user = await this.usersRepository.findByConfirmationCode(code);

    if (
      !user ||
      user.emailConfirmation.isConfirmed ||
      user.emailConfirmation.expirationDate < new Date()
    ) {
      return false;
    }

    return this.usersRepository.confirmEmail(user._id);
  }

  async resendRegistrationEmail(email: string): Promise<boolean> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user || user.emailConfirmation.isConfirmed) {
      return false;
    }

    const confirmationCode = uuidv4();
    const expirationDate = add(new Date(), { hours: 1 });
    const isUpdated = await this.usersRepository.updateConfirmationCode(
      user._id,
      confirmationCode,
      expirationDate,
    );

    if (!isUpdated) {
      return false;
    }

    await this.emailService.sendRegistrationEmail(email, confirmationCode);
    return true;
  }

  async passwordRecovery(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);

    // The endpoint intentionally returns 204 for an unknown email to avoid
    // leaking which email addresses are registered.
    if (!user) {
      return;
    }

    const recoveryCode = uuidv4();
    const expirationDate = add(new Date(), { hours: 1 });
    const isUpdated = await this.usersRepository.updateRecoveryCode(
      user._id,
      recoveryCode,
      expirationDate,
    );

    if (isUpdated) {
      await this.emailService.sendPasswordRecoveryEmail(email, recoveryCode);
    }
  }

  async setNewPassword(dto: NewPasswordDto): Promise<boolean> {
    const user = await this.usersRepository.findByRecoveryCode(
      dto.recoveryCode,
    );
    const expirationDate =
      user?.emailConfirmation.recoveryCodeExpirationDate;

    if (!user || !expirationDate || expirationDate < new Date()) {
      return false;
    }

    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      appConfig.bcryptSaltRounds,
    );

    return this.usersRepository.updatePassword(user._id, passwordHash);
  }
}
