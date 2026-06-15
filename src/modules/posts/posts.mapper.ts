import { PostDbModel } from './domain/post.entity';
import { PostViewDto } from './dto/post.view-dto';

export const mapPostToView = (post: PostDbModel): PostViewDto => ({
  id: post._id.toString(),
  title: post.title,
  shortDescription: post.shortDescription,
  content: post.content,
  blogId: post.blogId,
  blogName: post.blogName,
  createdAt: post.createdAt,
});