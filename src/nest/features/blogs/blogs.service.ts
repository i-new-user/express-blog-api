import { Injectable } from '@nestjs/common';
import { BlogViewDto } from '../../../modules/blogs/dto/blog.viewDto';
import { mapBlogToView } from './blogs.mapper';
import { BlogsRepository } from './blogs.repository';
import { CreateBlogDto } from './dto/blog.dto';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async create(dto: CreateBlogDto): Promise<BlogViewDto> {
    const blog = await this.blogsRepository.create({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    });

    return mapBlogToView(blog);
  }

  update(id: string, dto: CreateBlogDto): Promise<boolean> {
    return this.blogsRepository.updateById(id, dto);
  }

  delete(id: string): Promise<boolean> {
    return this.blogsRepository.deleteById(id);
  }
}
