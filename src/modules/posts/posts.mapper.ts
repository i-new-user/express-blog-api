import { LikeStatus } from '../comments/domain/comment.entity';
import { PostDbModel } from './domain/post.entity';
import { PostViewDto } from './dto/post.view-dto';

export const mapPostToView = (
  post: PostDbModel,
  userId?: string,
): PostViewDto => {
  const likes = post.likes ?? [];

  const myLike = userId
    ? likes.find((like) => like.userId === userId)
    : null;

  const newestLikes = likes
    .filter((like) => like.status === 'Like')
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    .slice(0, 3)
    .map((like) => ({
      addedAt: like.addedAt,
      userId: like.userId,
      login: like.userLogin,
    }));

  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: likes.filter((like) => like.status === 'Like').length,
      dislikesCount: likes.filter((like) => like.status === 'Dislike').length,
      myStatus: (myLike?.status ?? 'None') as LikeStatus,
      newestLikes,
    },
  };
};
