import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';
import { SecurityController } from './security.controller';
import { SecurityDevicesRepository } from './security-devices.repository';
import { SECURITY_COMMAND_HANDLERS } from './use-cases/security.use-cases';
@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [SecurityController],
  providers: [...SECURITY_COMMAND_HANDLERS],
})
export class SecurityModule {}
