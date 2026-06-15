import { Filter, ObjectId } from 'mongodb';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../common/helpers/pagination.helper';
import {
  escapeRegex,
  getAllowedSortBy,
} from '../../common/helpers/query.helper';
import { PaginationQuery } from '../../common/types/pagination.types';
import { getDb } from '../../db/mongo-client';
import { UserDbModel } from './domain/user.entity';
import { mapUserToView } from './users.mapper';

const getUsersCollection = () => getDb().collection<UserDbModel>('users');

const allowedUserSortFields = ['createdAt', 'login', 'email'] as const;

type UserSortField = (typeof allowedUserSortFields)[number];

type UsersQuery = PaginationQuery & {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};

export const usersQueryRepository = {
  async findUserById(id: string) {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const user = await getUsersCollection().findOne({
      _id: new ObjectId(id),
    });

    return user ? mapUserToView(user) : null;
  },

  async findUsers(query: UsersQuery) {
    const pagination = getPaginationParams(query);

    const sortBy = getAllowedSortBy<UserSortField>(
      pagination.sortBy,
      allowedUserSortFields,
      'createdAt',
    );

    const orFilters: Filter<UserDbModel>[] = [];

    if (query.searchLoginTerm) {
      orFilters.push({
        login: {
          $regex: escapeRegex(query.searchLoginTerm),
          $options: 'i',
        },
      });
    }

    if (query.searchEmailTerm) {
      orFilters.push({
        email: {
          $regex: escapeRegex(query.searchEmailTerm),
          $options: 'i',
        },
      });
    }

    const filter: Filter<UserDbModel> =
      orFilters.length > 0 ? { $or: orFilters } : {};

    const totalCount = await getUsersCollection().countDocuments(filter);

    const users = await getUsersCollection()
      .find(filter)
      .sort({ [sortBy]: pagination.sortDirection })
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