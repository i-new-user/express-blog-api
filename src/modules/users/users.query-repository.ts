import {
  buildPaginatedView,
  getPaginationParams,
} from '../../common/helpers/pagination.helper';
import {
  escapeRegex,
  getAllowedSortBy,
} from '../../common/helpers/query.helper';
import { PaginationQuery } from '../../common/types/pagination.types';
import { UserDbModel } from './domain/user.entity';
import { UserModel } from './domain/user.model';
import { mapUserToView } from './users.mapper';
import { isValidObjectId, QueryFilter } from 'mongoose';

const allowedUserSortFields = ['createdAt', 'login', 'email'] as const;

type UserSortField = (typeof allowedUserSortFields)[number];

type UsersQuery = PaginationQuery & {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};

export const usersQueryRepository = {
  
  async findUserById(id: string) {
    if (!isValidObjectId(id)) {
      return null;
    }

    const user = await UserModel.findById(id).lean();

    return user ? mapUserToView(user) : null;
  },

  async findUsers(query: UsersQuery) {
    const pagination = getPaginationParams(query);

    const sortBy = getAllowedSortBy<UserSortField>(
      pagination.sortBy,
      allowedUserSortFields,
      'createdAt',
    );

    const orFilters: QueryFilter<UserDbModel>[] = [];

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

    const filter: QueryFilter<UserDbModel> =
      orFilters.length > 0 ? { $or: orFilters } : {};

    const totalCount = await UserModel.countDocuments(filter);

    const users = await UserModel.find(filter)
      .sort({ [sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .lean();

    return buildPaginatedView({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: users.map(mapUserToView),
    });
  },
};
