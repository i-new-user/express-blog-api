import { getDb } from '../../../db/mongo-client';
import { SecurityDeviceDbModel } from './security-device.entity';

const collection = () =>
  getDb().collection<SecurityDeviceDbModel>('securityDevices');

export const securityDevicesRepository = {
  async create(device: SecurityDeviceDbModel): Promise<void> {
    await collection().insertOne(device);
  },

  async findByDeviceId(
    deviceId: string,
  ): Promise<SecurityDeviceDbModel | null> {
    return collection().findOne({ deviceId });
  },

  async findByDeviceIdAndLastActiveDate(
    deviceId: string,
    lastActiveDate: string,
  ): Promise<SecurityDeviceDbModel | null> {
    return collection().findOne({
      deviceId,
      lastActiveDate,
    });
  },

  async updateLastActiveDate(
    deviceId: string,
    lastActiveDate: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const result = await collection().updateOne(
      { deviceId },
      {
        $set: {
          lastActiveDate,
          expiresAt,
        },
      },
    );

    return result.matchedCount === 1;
  },

  async deleteByDeviceId(deviceId: string): Promise<boolean> {
    const result = await collection().deleteOne({ deviceId });

    return result.deletedCount === 1;
  },

  async deleteAllByUserId(userId: string): Promise<void> {
    await collection().deleteMany({ userId });
  },
};