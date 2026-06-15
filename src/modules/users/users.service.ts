import bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import { usersRepository } from './users.repository';
import { UserDbModel } from './domain/user.entity';
import { UserInputDto } from './dto/user.input-dto';
import { UserViewDto } from './dto/user.view-dto';

const mapUserToView = (user: UserDbModel): UserViewDto => {
  return {
    id: user._id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
  };
};

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
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed: true,
      },
    };

    await usersRepository.createUser(newUser);

    return mapUserToView(newUser);
  },

  async deleteUser(id: string): Promise<boolean> {
    return usersRepository.deleteUser(id);
  },
};