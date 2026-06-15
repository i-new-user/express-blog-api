import { ObjectId } from 'mongodb';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../common/helpers/pagination.helper';
import { PaginationQuery } from '../../common/types/pagination.types';
import { getDb } from '../../db/mongo-client';
import { CommentDbModel } from './domain/comment.entity';
import { CommentViewDto } from './dto/comment.view-dto';

const getCommentsCollection = () =>
  getDb().collection<CommentDbModel>('comments');

export const mapCommentToView = (
  comment: CommentDbModel,
): CommentViewDto => ({
  id: comment._id.toString(),
  content: comment.content,
  commentatorInfo: comment.commentatorInfo,
  createdAt: comment.createdAt,
});

export const commentsQueryRepository = {
  async findCommentById(id: string): Promise<CommentViewDto | null> {
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

    const filter = { postId };

    const totalCount = await getCommentsCollection().countDocuments(filter);

    const comments = await getCommentsCollection()
      .find(filter)
      .sort({ [pagination.sortBy]: pagination.sortDirection })
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