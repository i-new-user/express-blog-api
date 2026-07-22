import { model, Schema } from 'mongoose';
import { UserDbModel } from './user.entity';

const emailConfirmationSchema = new Schema(
  {
    confirmationCode: { type: String, required: true },
    expirationDate: { type: Date, required: true },
    isConfirmed: { type: Boolean, required: true, default: false },
    recoveryCode: { type: String, default: null },
    recoveryCodeExpirationDate: { type: Date, default: null },
  },
  { _id: false },
);

const userSchema = new Schema<UserDbModel>(
  {
    login: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: String, required: true },
    emailConfirmation: { type: emailConfirmationSchema, required: true },
  },
  {
    collection: 'users',
    versionKey: false,
  },
);

userSchema.index({ login: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'emailConfirmation.confirmationCode': 1 });
userSchema.index({ 'emailConfirmation.recoveryCode': 1 });

export const UserModel = model<UserDbModel>('User', userSchema);
