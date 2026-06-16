import bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import { jwtHelper } from '../../common/helpers/jwt/jwt.helper';
import {
  getDuplicateKeyField,
  isDuplicateKeyError,
} from '../../common/helpers/mongo-error.helper';
import { usersRepository } from '../users/users.repository';
import { UserDbModel } from '../users/domain/user.entity';
import { emailManager } from './email/email.manager';
import { securityDevicesRepository } from './devices/security-devices.repository';
import { SecurityDeviceDbModel } from './devices/security-device.entity';
import { LoginInputDto } from './dto/login.input-dto';
import { LoginSuccessViewDto } from './dto/login-success.view-dto';
import { MeViewDto } from './dto/me.view-dto';
import { RegistrationInputDto } from './dto/registration.input-dto';
import { RegistrationConfirmationCodeInputDto } from './dto/registration-confirmation-code.input-dto';
import { RegistrationEmailResendingInputDto } from './dto/registration-email-resending.input-dto';

type RegistrationResult =
  | { success: true }
  | { success: false; field: 'login' | 'email' };

type LoginResult = {
  accessToken: string;
  refreshToken: string;
};

export const authService = {
  async login(
    input: LoginInputDto,
    ip: string,
    title: string,
  ): Promise<LoginResult | null> {
    const user = await usersRepository.findByLoginOrEmail(input.loginOrEmail);

    if (!user || !user.emailConfirmation.isConfirmed) {
      return null;
    }

    const isPasswordCorrect = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordCorrect) {
      return null;
    }

    const deviceId = uuidv4();

    const accessToken = jwtHelper.createAccessToken(user._id.toString());
    const refreshToken = jwtHelper.createRefreshToken(
      user._id.toString(),
      deviceId,
    );

    const refreshPayload = jwtHelper.verifyRefreshToken(refreshToken);

    if (!refreshPayload) {
      return null;
    }

    const device: SecurityDeviceDbModel = {
      _id: new ObjectId(),
      userId: user._id.toString(),
      deviceId,
      ip,
      title,
      lastActiveDate: jwtHelper.getTokenIssuedAtDate(refreshPayload.iat),
      expiresAt: jwtHelper.getTokenExpirationDate(refreshPayload.exp),
    };

    await securityDevicesRepository.create(device);

    return {
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(
    userId: string,
    deviceId: string,
    tokenIssuedAt: string,
  ): Promise<LoginResult | null> {
    const device =
      await securityDevicesRepository.findByDeviceIdAndLastActiveDate(
        deviceId,
        tokenIssuedAt,
      );

    if (!device || device.userId !== userId) {
      return null;
    }

    const accessToken = jwtHelper.createAccessToken(userId);
    const refreshToken = jwtHelper.createRefreshToken(userId, deviceId);

    const refreshPayload = jwtHelper.verifyRefreshToken(refreshToken);

    if (!refreshPayload) {
      return null;
    }

    const isUpdated = await securityDevicesRepository.updateLastActiveDate(
      deviceId,
      jwtHelper.getTokenIssuedAtDate(refreshPayload.iat),
      jwtHelper.getTokenExpirationDate(refreshPayload.exp),
    );

    if (!isUpdated) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
    };
  },

  async logout(
    userId: string,
    deviceId: string,
    tokenIssuedAt: string,
  ): Promise<boolean> {
    const device =
      await securityDevicesRepository.findByDeviceIdAndLastActiveDate(
        deviceId,
        tokenIssuedAt,
      );

    if (!device || device.userId !== userId) {
      return false;
    }

    return securityDevicesRepository.deleteByDeviceId(deviceId);
  },

  async getMe(userId: string): Promise<MeViewDto | null> {
    const user = await usersRepository.findById(userId);

    if (!user) {
      return null;
    }

    return {
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
    };
  },

  async registration(input: RegistrationInputDto): Promise<RegistrationResult> {
    const passwordHash = await bcrypt.hash(input.password, env.bcryptSaltRounds);

    const confirmationCode = uuidv4();

    const newUser: UserDbModel = {
      _id: new ObjectId(),
      login: input.login,
      email: input.email,
      passwordHash,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode,
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed: false,
      },
    };

    try {
      await usersRepository.createUser(newUser);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const field = getDuplicateKeyField(error);

        return {
          success: false,
          field: field === 'email' ? 'email' : 'login',
        };
      }

      throw error;
    }

    await emailManager.sendRegistrationEmail(input.email, confirmationCode);

    return { success: true };
  },

  async confirmRegistration(
    input: RegistrationConfirmationCodeInputDto,
  ): Promise<boolean> {
    const user = await usersRepository.findByConfirmationCode(input.code);

    if (!user) {
      return false;
    }

    if (user.emailConfirmation.isConfirmed) {
      return false;
    }

    if (user.emailConfirmation.expirationDate < new Date()) {
      return false;
    }

    return usersRepository.confirmEmail(user._id);
  },

  async resendRegistrationEmail(
    input: RegistrationEmailResendingInputDto,
  ): Promise<boolean> {
    const user = await usersRepository.findByEmail(input.email);

    if (!user || user.emailConfirmation.isConfirmed) {
      return false;
    }

    const newConfirmationCode = uuidv4();
    const newExpirationDate = add(new Date(), { hours: 1 });

    const isUpdated = await usersRepository.updateConfirmationCode(
      user._id,
      newConfirmationCode,
      newExpirationDate,
    );

    if (!isUpdated) {
      return false;
    }

    await emailManager.sendRegistrationEmail(input.email, newConfirmationCode);

    return true;
  },
};