import { isValidObjectId, QueryFilter } from 'mongoose';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../common/helpers/pagination.helper';
import { getAllowedSortBy } from '../../common/helpers/query.helper';
import { PaginationQuery } from '../../common/types/pagination.types';
import { PostDbModel } from './domain/post.entity';
import { PostModel } from './domain/post.model';
import { mapPostToView } from './posts.mapper';

const allowedPostSortFields = [
  'createdAt',
  'title',
  'shortDescription',
  'content',
  'blogId',
  'blogName',
] as const;

type PostSortField = (typeof allowedPostSortFields)[number];

export const postsQueryRepository = {
  async findPostById(id: string, userId?: string) {
    if (!isValidObjectId(id)) {
      return null;
    }

    const post = await PostModel.findById(id).lean();

    return post ? mapPostToView(post, userId) : null;
  },

  async findPosts(query: PaginationQuery, userId?: string) {
    return this.findPostsByFilter({}, query, userId);
  },

  async findPostsByBlogId(
    blogId: string,
    query: PaginationQuery,
    userId?: string,
  ) {
    return this.findPostsByFilter({ blogId }, query, userId);
  },

  async findPostsByFilter(
    filter: QueryFilter<PostDbModel>,
    query: PaginationQuery,
    userId?: string,
  ) {
    const pagination = getPaginationParams(query);

    const sortBy = getAllowedSortBy<PostSortField>(
      pagination.sortBy,
      allowedPostSortFields,
      'createdAt',
    );

    const totalCount = await PostModel.countDocuments(filter);

    const posts = await PostModel.find(filter)
      .sort({ [sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .lean();

    return buildPaginatedView({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: posts.map((post) => mapPostToView(post, userId)),
    });
  },
};
