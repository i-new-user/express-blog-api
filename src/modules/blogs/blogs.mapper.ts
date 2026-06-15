import { BlogDbModel } from './domain/blog.entity';
import { BlogViewDto } from './dto/blog.view-dto';

export const mapBlogToView = (blog: BlogDbModel): BlogViewDto => ({
  id: blog._id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});