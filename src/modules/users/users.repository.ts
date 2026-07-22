import { isValidObjectId, Types } from 'mongoose';
import { UserDbModel } from './domain/user.entity';
import { UserModel } from './domain/user.model';

export const usersRepository = {
  async createUser(user: UserDbModel): Promise<void> {
    await UserModel.create(user);
  },

  async findById(id: string): Promise<UserDbModel | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return UserModel.findById(id).lean();
  },

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDbModel | null> {
    return UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    }).lean();
  },

  async findByLogin(login: string): Promise<UserDbModel | null> {
    return UserModel.findOne({ login }).lean();
  },

  async findByEmail(email: string): Promise<UserDbModel | null> {
    return UserModel.findOne({ email }).lean();
  },

  async isLoginExists(login: string): Promise<boolean> {
    return UserModel.exists({ login }).then(Boolean);
  },

  async isEmailExists(email: string): Promise<boolean> {
    return UserModel.exists({ email }).then(Boolean);
  },

  async findByConfirmationCode(code: string): Promise<UserDbModel | null> {
    return UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    }).lean();
  },

  async confirmEmail(userId: Types.ObjectId): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );

    return result.modifiedCount === 1;
  },

  async updateConfirmationCode(
    userId: Types.ObjectId,
    confirmationCode: string,
    expirationDate: Date,
  ): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          'emailConfirmation.confirmationCode': confirmationCode,
          'emailConfirmation.expirationDate': expirationDate,
        },
      },
    );

    return result.modifiedCount === 1;
  },

  async findByRecoveryCode(code: string): Promise<UserDbModel | null> {
    return UserModel.findOne({ 'emailConfirmation.recoveryCode': code }).lean();
  },

  async updateRecoveryCode(
    userId: Types.ObjectId,
    recoveryCode: string,
    expirationDate: Date,
  ): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          'emailConfirmation.recoveryCode': recoveryCode,
          'emailConfirmation.recoveryCodeExpirationDate': expirationDate,
        },
      },
    );

    return result.modifiedCount === 1;
  },

  async updatePassword(
    userId: Types.ObjectId,
    passwordHash: string,
  ): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          passwordHash,
          'emailConfirmation.recoveryCode': null,
          'emailConfirmation.recoveryCodeExpirationDate': null,
        },
      },
    );

    return result.modifiedCount === 1;
  },

  async deleteUser(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await UserModel.deleteOne({ _id: id });

    return result.deletedCount === 1;
  },
};
