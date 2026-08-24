import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SecurityDevice } from './domain/security-device.schema';

@Injectable()
export class SecurityDevicesRepository {
  constructor(@InjectModel(SecurityDevice.name) private readonly model: Model<SecurityDevice>) {}
  create(device: Omit<SecurityDevice, '_id'>) { return this.model.create(device); }
  findByDeviceId(deviceId: string) { return this.model.findOne({ deviceId }).lean<SecurityDevice>(); }
  findCurrent(deviceId: string, lastActiveDate: string) { return this.model.findOne({ deviceId, lastActiveDate }).lean<SecurityDevice>(); }
  findByUserId(userId: string) { return this.model.find({ userId }).lean<SecurityDevice[]>(); }
  async rotate(deviceId: string, previousDate: string, lastActiveDate: string, expiresAt: Date) {
    return (await this.model.updateOne({ deviceId, lastActiveDate: previousDate }, { $set: { lastActiveDate, expiresAt } })).modifiedCount === 1;
  }
  deleteOne(deviceId: string) { return this.model.deleteOne({ deviceId }); }
  deleteOthers(userId: string, deviceId: string) { return this.model.deleteMany({ userId, deviceId: { $ne: deviceId } }); }
}
