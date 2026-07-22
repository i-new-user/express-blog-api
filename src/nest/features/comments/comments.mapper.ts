import { CommentViewDto } from '../../../modules/comments/dto/comment.view-dto';
import { CommentEntity } from './domain/comment.schema';

export const mapCommentToView = (comment: CommentEntity): CommentViewDto => {
  const likes = comment.likes ?? [];

  return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: comment.commentatorInfo,
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: likes.filter((like) => like.status === 'Like').length,
      dislikesCount: likes.filter((like) => like.status === 'Dislike').length,
      myStatus: 'None',
    },
  };
};
