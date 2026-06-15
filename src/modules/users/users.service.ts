import bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import {
  getDuplicateKeyField,
  isDuplicateKeyError,
} from '../../common/helpers/mongo-error.helper';
import { usersRepository } from './users.repository';
import { UserDbModel } from './domain/user.entity';
import { UserInputDto } from './dto/user.input-dto';
import { UserViewDto } from './dto/user.view-dto';
import { mapUserToView } from './users.mapper';

type CreateUserResult =
  | {
      success: true;
      user: UserViewDto;
    }
  | {
      success: false;
      field: 'login' | 'email';
    };

export const usersService = {
  async createUser(input: UserInputDto): Promise<CreateUserResult> {
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

    try {
      await usersRepository.createUser(newUser);

      return {
        success: true,
        user: mapUserToView(newUser),
      };
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
  },

  async deleteUser(id: string): Promise<boolean> {
    return usersRepository.deleteUser(id);
  },
};