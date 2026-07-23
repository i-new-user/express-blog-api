import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { User } from './domain/user.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(user: Omit<User, '_id'>): Promise<User> {
    return this.userModel.create(user);
  }

  async findById(id: string): Promise<User | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.userModel.findById(id).lean<User>();
  }

  findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    return this.userModel
      .findOne({
        $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
      })
      .lean<User>();
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean<User>();
  }

  findByConfirmationCode(code: string): Promise<User | null> {
    return this.userModel
      .findOne({ 'emailConfirmation.confirmationCode': code })
      .lean<User>();
  }

  async confirmEmail(userId: Types.ObjectId): Promise<boolean> {
    const result = await this.userModel.updateOne(
      {
        _id: userId,
        'emailConfirmation.isConfirmed': false,
      },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );

    return result.modifiedCount === 1;
  }

  async updateConfirmationCode(
    userId: Types.ObjectId,
    confirmationCode: string,
    expirationDate: Date,
  ): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          'emailConfirmation.confirmationCode': confirmationCode,
          'emailConfirmation.expirationDate': expirationDate,
        },
      },
    );

    return result.modifiedCount === 1;
  }

  findByRecoveryCode(recoveryCode: string): Promise<User | null> {
    return this.userModel
      .findOne({ 'emailConfirmation.recoveryCode': recoveryCode })
      .lean<User>();
  }

  async updateRecoveryCode(
    userId: Types.ObjectId,
    recoveryCode: string,
    expirationDate: Date,
  ): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          'emailConfirmation.recoveryCode': recoveryCode,
          'emailConfirmation.recoveryCodeExpirationDate': expirationDate,
        },
      },
    );

    return result.modifiedCount === 1;
  }

  async updatePassword(
    userId: Types.ObjectId,
    passwordHash: string,
  ): Promise<boolean> {
    const result = await this.userModel.updateOne(
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
  }

  async deleteById(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await this.userModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
