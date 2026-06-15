import bcrypt from 'bcrypt';
import { jwtHelper } from '../../common/helpers/jwt/jwt.helper';
import { usersRepository } from '../users/users.repository';
import { LoginInputDto } from './dto/login.input-dto';
import { LoginSuccessViewDto } from './dto/login-success.view-dto';
import { MeViewDto } from './dto/me.view-dto';

export const authService = {
  async login(input: LoginInputDto): Promise<LoginSuccessViewDto | null> {
    const user = await usersRepository.findByLoginOrEmail(input.loginOrEmail);

    if (!user) {
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

    return {
      accessToken,
    };
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
};