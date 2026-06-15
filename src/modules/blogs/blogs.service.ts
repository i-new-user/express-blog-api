import { ObjectId } from 'mongodb';
import { blogsRepository } from './blogs.repository';
import { BlogDbModel } from './domain/blog.entity';
import { BlogInputDto } from './dto/blog.input-dto';
import { BlogViewDto } from './dto/blog.view-dto';

/**
 * Service — слой бизнес-логики.
 *
 * Здесь мы создаём сущность блога.
 * Controller не должен знать, как именно создаётся BlogDbModel.
 */
export const blogsService = {
  async createBlog(input: BlogInputDto): Promise<BlogViewDto> {
    const newBlog: BlogDbModel = {
      _id: new ObjectId(),
      name: input.name,
      description: input.description,
      websiteUrl: input.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    await blogsRepository.createBlog(newBlog);

    return {
      id: newBlog._id.toString(),
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt,
      isMembership: newBlog.isMembership,
    };
  },

  async updateBlog(id: string, input: BlogInputDto): Promise<boolean> {
    return blogsRepository.updateBlog(id, input);
  },

  async deleteBlog(id: string): Promise<boolean> {
    return blogsRepository.deleteBlog(id);
  },
};