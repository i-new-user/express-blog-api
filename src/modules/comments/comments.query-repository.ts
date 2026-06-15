import { Filter, ObjectId } from 'mongodb';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../common/helpers/pagination.helper';
import { getAllowedSortBy } from '../../common/helpers/query.helper';
import { PaginationQuery } from '../../common/types/pagination.types';
import { getDb } from '../../db/mongo-client';
import { CommentDbModel } from './domain/comment.entity';
import { mapCommentToView } from './comments.mapper';

const getCommentsCollection = () =>
  getDb().collection<CommentDbModel>('comments');

const allowedCommentSortFields = ['createdAt', 'content'] as const;

type CommentSortField = (typeof allowedCommentSortFields)[number];

export const commentsQueryRepository = {
  async findCommentById(id: string) {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const comment = await getCommentsCollection().findOne({
      _id: new ObjectId(id),
    });

    return comment ? mapCommentToView(comment) : null;
  },

  async findCommentsByPostId(postId: string, query: PaginationQuery) {
    const pagination = getPaginationParams(query);

    const sortBy = getAllowedSortBy<CommentSortField>(
      pagination.sortBy,
      allowedCommentSortFields,
      'createdAt',
    );

    const filter: Filter<CommentDbModel> = { postId };

    const totalCount = await getCommentsCollection().countDocuments(filter);

    const comments = await getCommentsCollection()
      .find(filter)
      .sort({ [sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .toArray();

    return buildPaginatedView({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: comments.map(mapCommentToView),
    });
  },
};