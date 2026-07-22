import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../../common/helpers/pagination.helper';
import { getAllowedSortBy } from '../../../common/helpers/query.helper';
import { CommentViewDto } from '../../../modules/comments/dto/comment.view-dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { mapCommentToView } from './comments.mapper';
import { CommentEntity } from './domain/comment.schema';

const allowedSortFields = ['createdAt', 'content'] as const;
type CommentSortField = (typeof allowedSortFields)[number];

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(CommentEntity.name)
    private readonly commentModel: Model<CommentEntity>,
  ) {}

  async findById(id: string): Promise<CommentViewDto | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const comment = await this.commentModel.findById(id).lean<CommentEntity>();
    return comment ? mapCommentToView(comment) : null;
  }

  async findByPostId(postId: string, query: PaginationQueryDto) {
    const pagination = getPaginationParams(query);
    const sortBy = getAllowedSortBy<CommentSortField>(
      pagination.sortBy,
      allowedSortFields,
      'createdAt',
    );
    const filter = { postId };
    const [totalCount, comments] = await Promise.all([
      this.commentModel.countDocuments(filter),
      this.commentModel
        .find(filter)
        .sort({ [sortBy]: pagination.sortDirection })
        .skip(pagination.skip)
        .limit(pagination.pageSize)
        .lean<CommentEntity[]>(),
    ]);

    return buildPaginatedView<CommentViewDto>({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: comments.map(mapCommentToView),
    });
  }
}
