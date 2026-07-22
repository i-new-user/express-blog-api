import { isValidObjectId, QueryFilter } from 'mongoose';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../common/helpers/pagination.helper';
import {
  escapeRegex,
  getAllowedSortBy,
} from '../../common/helpers/query.helper';
import { PaginationQuery } from '../../common/types/pagination.types';
import { mapBlogToView } from './blogs.mapper';
import { BlogDbModel } from './domain/blog.entity';
import { BlogModel } from './domain/blog.model';

const allowedBlogSortFields = [
  'createdAt',
  'name',
  'description',
  'websiteUrl',
  'isMembership',
] as const;

type BlogSortField = (typeof allowedBlogSortFields)[number];

type BlogsQuery = PaginationQuery & {
  searchNameTerm?: string;
};

export const blogsQueryRepository = {
  async findBlogById(id: string) {
    if (!isValidObjectId(id)) {
      return null;
    }

    const blog = await BlogModel.findById(id).lean();

    return blog ? mapBlogToView(blog) : null;
  },

  async findBlogs(query: BlogsQuery) {
    const pagination = getPaginationParams(query);

    const sortBy = getAllowedSortBy<BlogSortField>(
      pagination.sortBy,
      allowedBlogSortFields,
      'createdAt',
    );

    const filter: QueryFilter<BlogDbModel> = query.searchNameTerm
      ? {
          name: {
            $regex: escapeRegex(query.searchNameTerm),
            $options: 'i',
          },
        }
      : {};

    const totalCount = await BlogModel.countDocuments(filter);

    const blogs = await BlogModel.find(filter)
      .sort({ [sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .lean();

    return buildPaginatedView({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: blogs.map(mapBlogToView),
    });
  },
};
