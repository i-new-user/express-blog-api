import { isValidObjectId, QueryFilter } from 'mongoose';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../common/helpers/pagination.helper';
import { getAllowedSortBy } from '../../common/helpers/query.helper';
import { PaginationQuery } from '../../common/types/pagination.types';
import { mapCommentToView } from './comments.mapper';
import { CommentDbModel } from './domain/comment.entity';
import { CommentModel } from './domain/comment.model';

const allowedCommentSortFields = ['createdAt', 'content'] as const;

type CommentSortField = (typeof allowedCommentSortFields)[number];

export const commentsQueryRepository = {
  async findCommentById(id: string, userId?: string) {
    if (!isValidObjectId(id)) {
      return null;
    }

    const comment = await CommentModel.findById(id).lean();

    return comment ? mapCommentToView(comment, userId) : null;
  },

  async findCommentsByPostId(
    postId: string,
    query: PaginationQuery,
    userId?: string,
  ) {
    const pagination = getPaginationParams(query);

    const sortBy = getAllowedSortBy<CommentSortField>(
      pagination.sortBy,
      allowedCommentSortFields,
      'createdAt',
    );

    const filter: QueryFilter<CommentDbModel> = { postId };

    const totalCount = await CommentModel.countDocuments(filter);

    const comments = await CommentModel.find(filter)
      .sort({ [sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .lean();

    return buildPaginatedView({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: comments.map((comment) => mapCommentToView(comment, userId)),
    });
  },
};
