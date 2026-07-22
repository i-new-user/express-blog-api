import { model, Schema } from 'mongoose';
import { BlogDbModel } from './blog.entity';

const blogSchema = new Schema<BlogDbModel>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    websiteUrl: { type: String, required: true },
    createdAt: { type: String, required: true },
    isMembership: { type: Boolean, required: true, default: false },
  },
  {
    collection: 'blogs',
    versionKey: false,
  },
);

blogSchema.index({ name: 1 });
blogSchema.index({ createdAt: -1 });

export const BlogModel = model<BlogDbModel>('Blog', blogSchema);
