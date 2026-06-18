import { CommentDbModel, LikeStatus } from './domain/comment.entity';
import { CommentViewDto } from './dto/comment.view-dto';

export const mapCommentToView = (
  comment: CommentDbModel,
  userId?: string,
): CommentViewDto => {
  const likes = comment.likes ?? [];

  const myLike = userId
    ? likes.find((like) => like.userId === userId)
    : null;

  return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: comment.commentatorInfo,
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: likes.filter((like) => like.status === 'Like').length,
      dislikesCount: likes.filter((like) => like.status === 'Dislike').length,
      myStatus: (myLike?.status ?? 'None') as LikeStatus,
    },
  };
};