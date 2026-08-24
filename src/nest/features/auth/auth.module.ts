import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BearerAuthGuard } from './bearer-auth.guard';
import { EmailService } from './email.service';
import { JwtTokenService } from './jwt-token.service';
import { OptionalBearerAuthGuard } from './optional-bearer-auth.guard';
import { LoginUseCase } from './use-cases/login.use-case';
import { AUTH_COMMAND_HANDLERS } from './use-cases/auth.use-cases';
import { SecurityDevice, SecurityDeviceSchema } from '../security/domain/security-device.schema';
import { SecurityDevicesRepository } from '../security/security-devices.repository';
import { RefreshTokenGuard } from './refresh-token.guard';
import { SESSION_COMMAND_HANDLERS } from './use-cases/refresh-session.use-cases';

@Module({
  imports: [UsersModule, CqrsModule, MongooseModule.forFeature([{ name: SecurityDevice.name, schema: SecurityDeviceSchema }])],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtTokenService,
    BearerAuthGuard,
    EmailService,
    OptionalBearerAuthGuard,
    LoginUseCase,
    ...AUTH_COMMAND_HANDLERS,
    SecurityDevicesRepository,
    RefreshTokenGuard,
    ...SESSION_COMMAND_HANDLERS,
  ],
  exports: [EmailService, JwtTokenService, BearerAuthGuard, OptionalBearerAuthGuard, RefreshTokenGuard, SecurityDevicesRepository],
})
export class AuthModule {}
