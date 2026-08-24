import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BearerAuthGuard } from './bearer-auth.guard';
import { EmailService } from './email.service';
import { JwtTokenService } from './jwt-token.service';
import { OptionalBearerAuthGuard } from './optional-bearer-auth.guard';
import { LoginUseCase } from './use-cases/login.use-case';
import { AUTH_COMMAND_HANDLERS } from './use-cases/auth.use-cases';

@Module({
  imports: [UsersModule, CqrsModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtTokenService,
    BearerAuthGuard,
    EmailService,
    OptionalBearerAuthGuard,
    LoginUseCase,
    ...AUTH_COMMAND_HANDLERS,
  ],
  exports: [EmailService, JwtTokenService, BearerAuthGuard, OptionalBearerAuthGuard],
})
export class AuthModule {}
