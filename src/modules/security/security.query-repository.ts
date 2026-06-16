import { getDb } from '../../db/mongo-client';
import { DeviceViewDto } from './dto/device.view-dto';

export const securityQueryRepository = {
  async getDevicesByUserId(
    userId: string,
  ): Promise<DeviceViewDto[]> {
    const db = getDb();

    const devices = await db
      .collection('securityDevices')
      .find({ userId })
      .toArray();

    return devices.map((device) => ({
      ip: device.ip,
      title: device.title,
      lastActiveDate: device.lastActiveDate,
      deviceId: device.deviceId,
    }));
  },
};