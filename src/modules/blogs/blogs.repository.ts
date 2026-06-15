import { ObjectId } from 'mongodb';
import { getDb } from '../../db/mongo-client';
import { BlogDbModel } from './domain/blog.entity';

const getBlogsCollection = () => getDb().collection<BlogDbModel>('blogs');

/**
 * Repository отвечает только за запись/изменение/удаление данных.
 * Никакой HTTP-логики здесь быть не должно.
 */
export const blogsRepository = {
  async createBlog(blog: BlogDbModel): Promise<void> {
    await getBlogsCollection().insertOne(blog);
  },

  async findBlogById(id: string): Promise<BlogDbModel | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return getBlogsCollection().findOne({
      _id: new ObjectId(id),
    });
  },

  async updateBlog(id: string, input: Omit<BlogDbModel, '_id' | 'createdAt' | 'isMembership'>): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const result = await getBlogsCollection().updateOne(
      { _id: new ObjectId(id) },
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
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const result = await getBlogsCollection().deleteOne({
      _id: new ObjectId(id),
    });

    return result.deletedCount === 1;
  },
};