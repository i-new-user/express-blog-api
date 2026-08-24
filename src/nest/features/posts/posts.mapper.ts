import { PostViewDto } from '../../../modules/posts/dto/post.view-dto';
import { PostEntity } from './domain/post.schema';

export const mapPostToView = (post: PostEntity, userId?: string): PostViewDto => {
  const likes = post.likes ?? [];
  const newestLikes = likes
    .filter((like) => like.status === 'Like')
    .sort((first, second) => second.addedAt.localeCompare(first.addedAt))
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
      myStatus: likes.find((like) => like.userId === userId)?.status ?? 'None',
      newestLikes,
    },
  };
};
