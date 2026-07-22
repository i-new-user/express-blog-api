import { HydratedDocument, Types } from 'mongoose';

export type EmailConfirmation = {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
  recoveryCode?: string | null;
  recoveryCodeExpirationDate?: Date | null;
};

export type UserDbModel = {
  _id: Types.ObjectId;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  emailConfirmation: EmailConfirmation;
};

export type UserDocument = HydratedDocument<UserDbModel>;
