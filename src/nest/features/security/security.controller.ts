import { Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Req, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RefreshTokenGuard } from '../auth/refresh-token.guard';
import type { RefreshAuthenticatedRequest } from '../auth/refresh-token.guard';
import { SecurityDevicesRepository } from './security-devices.repository';
import { DeleteDeviceCommand, DeleteOtherDevicesCommand } from './use-cases/security.use-cases';

@Controller('security/devices')
@UseGuards(RefreshTokenGuard)
export class SecurityController {
  constructor(private readonly devices: SecurityDevicesRepository, private readonly bus: CommandBus) {}
  @Get()
  async getDevices(@Req() req: RefreshAuthenticatedRequest) {
    return (await this.devices.findByUserId(req.userId)).map(({ ip, title, lastActiveDate, deviceId }) => ({ ip, title, lastActiveDate, deviceId }));
  }
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOthers(@Req() req: RefreshAuthenticatedRequest) { await this.bus.execute(new DeleteOtherDevicesCommand(req.userId, req.deviceId)); }
  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevice(@Param('deviceId') deviceId: string, @Req() req: RefreshAuthenticatedRequest) {
    const result = await this.bus.execute(new DeleteDeviceCommand(req.userId, deviceId));
    if (result === 'not-found') throw new NotFoundException();
    if (result === 'forbidden') throw new ForbiddenException();
  }
}
