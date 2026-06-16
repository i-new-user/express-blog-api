import { ObjectId } from 'mongodb';

export type SecurityDeviceDbModel = {
  _id: ObjectId;
  userId: string;

  deviceId: string;

  ip: string;
  title: string;

  lastActiveDate: string;

  expiresAt: Date;
};