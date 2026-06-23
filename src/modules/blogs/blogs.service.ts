// import { ObjectId } from 'mongodb';
import { blogsRepository } from './blogs.repository';
// import { BlogDbModel } from './domain/blog.entity';
import { BlogInputDto } from './dto/blog.inputDto';
import { BlogViewDto } from './dto/blog.viewDto';
import { mapBlogToView } from './blogs.mapper';

export const blogsService = {
  async createBlog(input: BlogInputDto): Promise<BlogViewDto> {
    const newBlog = {
      // _id: new ObjectId(),
      name: input.name,
      description: input.description,
      websiteUrl: input.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    const createdBlog = await blogsRepository.createBlog(newBlog);

    return mapBlogToView(createdBlog);
  },

  async updateBlog(id: string, input: BlogInputDto): Promise<boolean> {
    return blogsRepository.updateBlog(id, input);
  },

  async deleteBlog(id: string): Promise<boolean> {
    return blogsRepository.deleteBlog(id);
  },
};