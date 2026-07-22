import { HydratedDocument, Types } from 'mongoose';

export type SecurityDeviceDbModel = {
  _id: Types.ObjectId;
  userId: string;
  deviceId: string;
  ip: string;
  title: string;
  lastActiveDate: string;
  expiresAt: Date;
};

export type SecurityDeviceDocument = HydratedDocument<SecurityDeviceDbModel>;
