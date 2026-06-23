// import { ObjectId } from 'mongodb';
// import { getDb } from '../../db/mongo-client';
// import { BlogDbModel } from './domain/blog.entity';

import { isValidObjectId } from "mongoose";
import { BlogModel } from "./domain/blog.model";
import { Blog, BlogDocument } from "./domain/blog.entity";
import { BlogInputDto } from "./dto/blog.inputDto";

type CreateBlogModel = BlogInputDto & {
  createdAt: string
  isMembership: boolean
}

// const getBlogsCollection = () => getDb().collection<BlogDbModel>('blogs');

/**
 * Repository отвечает только за запись/изменение/удаление данных.
 * Никакой HTTP-логики здесь быть не должно.
 */
export const blogsRepository = {
  async createBlog(blog: CreateBlogModel): Promise<BlogDocument> {
    const createdBlog = await BlogModel.create(blog);
    return createdBlog
  },

   async findBlogById(id: string): Promise<BlogDocument | null> {
    return BlogModel.findById(id);
  },
  // async findBlogById(id: string): Promise<CreateBlogModel | null> {
  //   if (!isValidObjectId(id)) {
  //     return null;
  //   }

  //   return BlogModel.findById(id)
  // },

  async updateBlog(id: string, input: Omit<CreateBlogModel, '_id' | 'createdAt' | 'isMembership'>): Promise<boolean> {
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