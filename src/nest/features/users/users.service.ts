import { BadRequestException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import {
  getDuplicateKeyField,
  isDuplicateKeyError,
} from '../../../common/helpers/mongo-error.helper';
import { UserViewDto } from '../../../modules/users/dto/user.view-dto';
import { appConfig } from '../../config/app.config';
import { CreateUserDto } from './dto/create-user.dto';
import { mapUserToView } from './users.mapper';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<UserViewDto> {
    const passwordHash = await bcrypt.hash(
      dto.password,
      appConfig.bcryptSaltRounds,
    );

    try {
      const user = await this.usersRepository.create({
        login: dto.login,
        email: dto.email,
        passwordHash,
        createdAt: new Date().toISOString(),
        emailConfirmation: {
          confirmationCode: uuidv4(),
          expirationDate: add(new Date(), { hours: 1 }),
          isConfirmed: true,
          recoveryCode: null,
          recoveryCodeExpirationDate: null,
        },
      });

      return mapUserToView(user);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const field = getDuplicateKeyField(error) === 'email' ? 'email' : 'login';
        throw new BadRequestException({
          errorsMessages: [
            { message: `User with this ${field} already exists`, field },
          ],
        });
      }

      throw error;
    }
  }

  delete(id: string): Promise<boolean> {
    return this.usersRepository.deleteById(id);
  }
}
