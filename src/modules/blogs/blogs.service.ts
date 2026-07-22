import { blogsRepository } from './blogs.repository';
import { mapBlogToView } from './blogs.mapper';
import { BlogInputDto } from './dto/blog.inputDto';
import { BlogViewDto } from './dto/blog.viewDto';

export const blogsService = {
  async createBlog(input: BlogInputDto): Promise<BlogViewDto> {
    const createdBlog = await blogsRepository.createBlog({
      name: input.name,
      description: input.description,
      websiteUrl: input.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    });

    return mapBlogToView(createdBlog);
  },

  async updateBlog(id: string, input: BlogInputDto): Promise<boolean> {
    return blogsRepository.updateBlog(id, input);
  },

  async deleteBlog(id: string): Promise<boolean> {
    return blogsRepository.deleteBlog(id);
  },
};
