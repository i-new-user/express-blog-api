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
import { BlogDbModel } from './domain/blog.entity';
import { mapBlogToView } from './blogs.mapper';

const getBlogsCollection = () => getDb().collection<BlogDbModel>('blogs');

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
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const blog = await getBlogsCollection().findOne({
      _id: new ObjectId(id),
    });

    return blog ? mapBlogToView(blog) : null;
  },

  async findBlogs(query: BlogsQuery) {
    const pagination = getPaginationParams(query);

    const sortBy = getAllowedSortBy<BlogSortField>(
      pagination.sortBy,
      allowedBlogSortFields,
      'createdAt',
    );

    const filter: Filter<BlogDbModel> = query.searchNameTerm
      ? {
          name: {
            $regex: escapeRegex(query.searchNameTerm),
            $options: 'i',
          },
        }
      : {};

    const totalCount = await getBlogsCollection().countDocuments(filter);

    const blogs = await getBlogsCollection()
      .find(filter)
      .sort({ [sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .toArray();

    return buildPaginatedView({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: blogs.map(mapBlogToView),
    });
  },
};