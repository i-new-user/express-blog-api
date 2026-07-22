import { BlogViewDto } from '../../../modules/blogs/dto/blog.viewDto';
import { Blog } from './domain/blog.schema';

export const mapBlogToView = (blog: Blog): BlogViewDto => ({
  id: blog._id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});
