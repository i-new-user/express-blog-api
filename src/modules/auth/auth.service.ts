import bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import { jwtHelper } from '../../common/helpers/jwt/jwt.helper';
import { usersRepository } from '../users/users.repository';
import { UserDbModel } from '../users/domain/user.entity';
import { emailManager } from './email/email.manager';
import { LoginInputDto } from './dto/login.input-dto';
import { LoginSuccessViewDto } from './dto/login-success.view-dto';
import { MeViewDto } from './dto/me.view-dto';
import { RegistrationInputDto } from './dto/registration.input-dto';
import { RegistrationConfirmationCodeInputDto } from './dto/registration-confirmation-code.input-dto';
import { RegistrationEmailResendingInputDto } from './dto/registration-email-resending.input-dto';

export const authService = {
  async login(input: LoginInputDto): Promise<LoginSuccessViewDto | null> {
    const user = await usersRepository.findByLoginOrEmail(input.loginOrEmail);

    if (!user) {
      return null;
    }

    if (!user.emailConfirmation.isConfirmed) {
      return null;
    }

    const isPasswordCorrect = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordCorrect) {
      return null;
    }

    const accessToken = jwtHelper.createAccessToken(user._id.toString());

    return { accessToken };
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

  async registration(input: RegistrationInputDto): Promise<boolean> {
    const isLoginExists = await usersRepository.isLoginExists(input.login);
    if (isLoginExists) {
      return false;
    }

    const isEmailExists = await usersRepository.isEmailExists(input.email);
    if (isEmailExists) {
      return false;
    }

    const passwordHash = await bcrypt.hash(
      input.password,
      env.bcryptSaltRounds,
    );

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

    await usersRepository.createUser(newUser);
    await emailManager.sendRegistrationEmail(input.email, confirmationCode);

    return true;
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

    if (!user) {
      return false;
    }

    if (user.emailConfirmation.isConfirmed) {
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