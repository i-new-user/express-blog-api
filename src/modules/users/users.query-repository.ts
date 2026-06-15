import { Filter, ObjectId } from 'mongodb';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../common/helpers/pagination.helper';
import { PaginationQuery } from '../../common/types/pagination.types';
import { getDb } from '../../db/mongo-client';
import { UserDbModel } from './domain/user.entity';
import { UserViewDto } from './dto/user.view-dto';

const getUsersCollection = () => getDb().collection<UserDbModel>('users');

type UsersQuery = PaginationQuery & {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};

export const mapUserToView = (user: UserDbModel): UserViewDto => ({
  id: user._id.toString(),
  login: user.login,
  email: user.email,
  createdAt: user.createdAt,
});

export const usersQueryRepository = {
  async findUserById(id: string): Promise<UserViewDto | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const user = await getUsersCollection().findOne({ _id: new ObjectId(id) });

    return user ? mapUserToView(user) : null;
  },

  async findUsers(query: UsersQuery) {
    const pagination = getPaginationParams(query);

    const orFilters: Filter<UserDbModel>[] = [];

    if (query.searchLoginTerm) {
      orFilters.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      orFilters.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const filter: Filter<UserDbModel> =
      orFilters.length > 0 ? { $or: orFilters } : {};

    const totalCount = await getUsersCollection().countDocuments(filter);

    const users = await getUsersCollection()
      .find(filter)
      .sort({ [pagination.sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .toArray();

    return buildPaginatedView({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: users.map(mapUserToView),
    });
  },
};