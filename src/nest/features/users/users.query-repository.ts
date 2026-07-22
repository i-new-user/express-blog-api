import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../../common/helpers/pagination.helper';
import {
  escapeRegex,
  getAllowedSortBy,
} from '../../../common/helpers/query.helper';
import { UserViewDto } from '../../../modules/users/dto/user.view-dto';
import { UsersQueryDto } from './dto/create-user.dto';
import { User } from './domain/user.schema';
import { mapUserToView } from './users.mapper';

const allowedSortFields = ['createdAt', 'login', 'email'] as const;
type UserSortField = (typeof allowedSortFields)[number];

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async findAll(query: UsersQueryDto) {
    const pagination = getPaginationParams(query);
    const sortBy = getAllowedSortBy<UserSortField>(
      pagination.sortBy,
      allowedSortFields,
      'createdAt',
    );

    const orFilters: QueryFilter<User>[] = [];

    if (query.searchLoginTerm) {
      orFilters.push({
        login: { $regex: escapeRegex(query.searchLoginTerm), $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      orFilters.push({
        email: { $regex: escapeRegex(query.searchEmailTerm), $options: 'i' },
      });
    }

    const filter: QueryFilter<User> = orFilters.length ? { $or: orFilters } : {};
    const [totalCount, users] = await Promise.all([
      this.userModel.countDocuments(filter),
      this.userModel
        .find(filter)
        .sort({ [sortBy]: pagination.sortDirection })
        .skip(pagination.skip)
        .limit(pagination.pageSize)
        .lean(),
    ]);

    return buildPaginatedView<UserViewDto>({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: users.map((user) => mapUserToView(user as User)),
    });
  }
}
