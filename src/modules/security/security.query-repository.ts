import { SecurityDeviceModel } from '../auth/devices/security-device.model';
import { DeviceViewDto } from './dto/device.view-dto';

export const securityQueryRepository = {
  async getDevicesByUserId(userId: string): Promise<DeviceViewDto[]> {
    const devices = await SecurityDeviceModel.find({ userId }).lean();

    return devices.map((device) => ({
      ip: device.ip,
      title: device.title,
      lastActiveDate: device.lastActiveDate,
      deviceId: device.deviceId,
    }));
  },
};
