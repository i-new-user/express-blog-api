import { SecurityDeviceDbModel } from './security-device.entity';
import { SecurityDeviceModel } from './security-device.model';

export const securityDevicesRepository = {
  
  async create(device: SecurityDeviceDbModel): Promise<void> {
    await SecurityDeviceModel.create(device);
  },

  async findByDeviceId( deviceId: string, ): Promise<SecurityDeviceDbModel | null> {
    return SecurityDeviceModel.findOne({ deviceId }).lean();
  },

  async findByDeviceIdAndLastActiveDate( deviceId: string, lastActiveDate: string, ): Promise<SecurityDeviceDbModel | null> {
    return SecurityDeviceModel.findOne({ deviceId, lastActiveDate }).lean();
  },

  async updateLastActiveDate( deviceId: string, lastActiveDate: string, expiresAt: Date ): Promise<boolean> {
   
    const result = await SecurityDeviceModel.updateOne(
      { deviceId },
      { $set: { lastActiveDate, expiresAt } },
    );

    return result.matchedCount === 1;
  },

  async deleteByDeviceId(deviceId: string): Promise<boolean> {
    const result = await SecurityDeviceModel.deleteOne({ deviceId });

    return result.deletedCount === 1;
  },

  async deleteAllByUserId(userId: string): Promise<void> {
    await SecurityDeviceModel.deleteMany({ userId });
  },

  async deleteAllOtherDevices( userId: string, currentDeviceId: string ): Promise<void> {
    
    await SecurityDeviceModel.deleteMany({
      userId,
      deviceId: { $ne: currentDeviceId },
    });

  },
};
