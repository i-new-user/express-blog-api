import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';
import { User, UserSchema } from './domain/user.schema';
import { UsersController } from './users.controller';
import { UsersQueryRepository } from './users.query-repository';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    BasicAuthGuard,
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
