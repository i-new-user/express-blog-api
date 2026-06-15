import { ObjectId } from 'mongodb';
import { getDb } from '../../db/mongo-client';
import { UserDbModel } from './domain/user.entity';

const getUsersCollection = () => getDb().collection<UserDbModel>('users');

export const usersRepository = {
  async createUser(user: UserDbModel): Promise<void> {
    await getUsersCollection().insertOne(user);
  },

  async findById(id: string): Promise<UserDbModel | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return getUsersCollection().findOne({ _id: new ObjectId(id) });
  },

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDbModel | null> {
    return getUsersCollection().findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  },

  async isLoginExists(login: string): Promise<boolean> {
    const user = await getUsersCollection().findOne({ login });
    return !!user;
  },

  async isEmailExists(email: string): Promise<boolean> {
    const user = await getUsersCollection().findOne({ email });
    return !!user;
  },

  async deleteUser(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const result = await getUsersCollection().deleteOne({
      _id: new ObjectId(id),
    });

    return result.deletedCount === 1;
  },
};