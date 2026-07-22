import { model, Schema } from 'mongoose';
import { SecurityDeviceDbModel } from './security-device.entity';

const securityDeviceSchema = new Schema<SecurityDeviceDbModel>(
  {
    userId: { type: String, required: true },
    deviceId: { type: String, required: true, unique: true },
    ip: { type: String, required: true },
    title: { type: String, required: true },
    lastActiveDate: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    collection: 'securityDevices',
    versionKey: false,
  },
);

securityDeviceSchema.index({ deviceId: 1 }, { unique: true });
securityDeviceSchema.index({ userId: 1 });
securityDeviceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SecurityDeviceModel = model<SecurityDeviceDbModel>(
  'SecurityDevice',
  securityDeviceSchema,
);
