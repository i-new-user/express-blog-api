import { isValidObjectId } from 'mongoose';
import { BlogInputDto } from './dto/blog.inputDto';
import { BlogDbModel, BlogDocument } from './domain/blog.entity';
import { BlogModel } from './domain/blog.model';

type CreateBlogModel = BlogInputDto & {
  createdAt: string;
  isMembership: boolean;
};

export const blogsRepository = {
  async createBlog(blog: CreateBlogModel): Promise<BlogDocument> {
    return BlogModel.create(blog);
  },

  async findBlogById(id: string): Promise<BlogDbModel | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return BlogModel.findById(id).lean();
  },

  async updateBlog(id: string, input: BlogInputDto): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await BlogModel.updateOne(
      { _id: id },
      {
        $set: {
          name: input.name,
          description: input.description,
          websiteUrl: input.websiteUrl,
        },
      },
    );

    return result.matchedCount === 1;
  },

  async deleteBlog(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await BlogModel.deleteOne({ _id: id });

    return result.deletedCount === 1;
  },
};
