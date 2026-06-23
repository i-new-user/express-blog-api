import { Types } from 'mongoose';
import { BlogDocument } from './domain/blog.entity';
import { BlogViewDto } from './dto/blog.viewDto';

type BlogForView =
  | BlogDocument
  | {
      _id: Types.ObjectId;
      name: string;
      description: string;
      websiteUrl: string;
      createdAt: string;
      isMembership: boolean;
    };

export const mapBlogToView = (blog: BlogForView): BlogViewDto => ({
  id: blog._id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});