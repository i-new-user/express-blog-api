import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../security-devices.repository';
export class DeleteOtherDevicesCommand { constructor(public userId: string, public deviceId: string) {} }
export class DeleteDeviceCommand { constructor(public userId: string, public deviceId: string) {} }
@CommandHandler(DeleteOtherDevicesCommand)
export class DeleteOtherDevicesUseCase implements ICommandHandler<DeleteOtherDevicesCommand> {
  constructor(private readonly repo: SecurityDevicesRepository) {}
  async execute(c: DeleteOtherDevicesCommand) { await this.repo.deleteOthers(c.userId, c.deviceId); }
}
@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase implements ICommandHandler<DeleteDeviceCommand> {
  constructor(private readonly repo: SecurityDevicesRepository) {}
  async execute(c: DeleteDeviceCommand) {
    const device = await this.repo.findByDeviceId(c.deviceId);
    if (!device) return 'not-found';
    if (device.userId !== c.userId) return 'forbidden';
    await this.repo.deleteOne(c.deviceId);
    return 'success';
  }
}
export const SECURITY_COMMAND_HANDLERS = [DeleteOtherDevicesUseCase, DeleteDeviceUseCase];
