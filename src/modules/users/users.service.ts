import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { env } from '../../config/env';
import { UserDbModel } from './domain/user.entity';
import { UserInputDto } from './dto/user.input-dto';
import { UserViewDto } from './dto/user.view-dto';
import { usersRepository } from './users.repository';

/**
 * UsersService — бизнес-логика пользователей.
 *
 * Здесь:
 * - проверяем уникальность login/email
 * - хэшируем пароль
 * - создаём пользователя
 *
 * Controller не должен знать, как работает bcrypt.
 */
export const usersService = {
  async createUser(input: UserInputDto): Promise<UserViewDto | null> {
    const isLoginExists = await usersRepository.isLoginExists(input.login);

    if (isLoginExists) {
      return null;
    }

    const isEmailExists = await usersRepository.isEmailExists(input.email);

    if (isEmailExists) {
      return null;
    }

    const passwordHash = await bcrypt.hash(
      input.password,
      env.bcryptSaltRounds,
    );

    const newUser: UserDbModel = {
      _id: new ObjectId(),
      login: input.login,
      email: input.email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await usersRepository.createUser(newUser);

    return {
      id: newUser._id.toString(),
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  },

  async deleteUser(id: string): Promise<boolean> {
    return usersRepository.deleteUser(id);
  },
};