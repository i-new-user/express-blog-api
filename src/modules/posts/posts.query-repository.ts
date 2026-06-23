import { Filter, ObjectId } from 'mongodb';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../common/helpers/pagination.helper';
import { getAllowedSortBy } from '../../common/helpers/query.helper';
import { PaginationQuery } from '../../common/types/pagination.types';
import { getDb } from '../../db/mongo-client';
import { PostDbModel } from './domain/post.entity';
import { mapPostToView } from './posts.mapper';

const getPostsCollection = () => getDb().collection<PostDbModel>('posts');

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
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const post = await getPostsCollection().findOne({
      _id: new ObjectId(id),
    });

    return post ? mapPostToView(post, userId) : null;
  },

  async findPosts(query: PaginationQuery, userId?: string) {
    const pagination = getPaginationParams(query);

    const sortBy = getAllowedSortBy<PostSortField>(
      pagination.sortBy,
      allowedPostSortFields,
      'createdAt',
    );

    const filter: Filter<PostDbModel> = {};

    const totalCount = await getPostsCollection().countDocuments(filter);

    const posts = await getPostsCollection()
      .find(filter)
      .sort({ [sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .toArray();

    return buildPaginatedView({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: posts.map((post) => mapPostToView(post, userId)),
    });
  },

  async findPostsByBlogId(
    blogId: string,
    query: PaginationQuery,
    userId?: string,
  ) {
    const pagination = getPaginationParams(query);

    const sortBy = getAllowedSortBy<PostSortField>(
      pagination.sortBy,
      allowedPostSortFields,
      'createdAt',
    );

    const filter: Filter<PostDbModel> = { blogId };

    const totalCount = await getPostsCollection().countDocuments(filter);

    const posts = await getPostsCollection()
      .find(filter)
      .sort({ [sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .toArray();

    return buildPaginatedView({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: posts.map((post) => mapPostToView(post, userId)),
    });
  },
};
