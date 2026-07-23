import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BearerAuthGuard } from './bearer-auth.guard';
import { EmailService } from './email.service';
import { JwtTokenService } from './jwt-token.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtTokenService,
    BearerAuthGuard,
    EmailService,
  ],
  exports: [EmailService],
})
export class AuthModule {}
