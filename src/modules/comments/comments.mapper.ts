import { CommentDbModel } from './domain/comment.entity';
import { CommentViewDto } from './dto/comment.view-dto';

export const mapCommentToView = (
  comment: CommentDbModel,
): CommentViewDto => ({
  id: comment._id.toString(),
  content: comment.content,
  commentatorInfo: comment.commentatorInfo,
  createdAt: comment.createdAt,
});