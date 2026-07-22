import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../../../modules/posts/dto/post.view-dto';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CreateBlogPostDto, CreatePostDto } from './dto/post.dto';
import { mapPostToView } from './posts.mapper';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async create(dto: CreatePostDto): Promise<PostViewDto | null> {
    const blog = await this.blogsRepository.findById(dto.blogId);

    if (!blog) {
      return null;
    }

    const post = await this.postsRepository.create({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog._id.toString(),
      blogName: blog.name,
      createdAt: new Date().toISOString(),
      likes: [],
    });

    return mapPostToView(post);
  }

  createForBlog(
    blogId: string,
    dto: CreateBlogPostDto,
  ): Promise<PostViewDto | null> {
    return this.create({ ...dto, blogId });
  }

  async update(id: string, dto: CreatePostDto): Promise<boolean> {
    const blog = await this.blogsRepository.findById(dto.blogId);

    if (!blog) {
      return false;
    }

    return this.postsRepository.updateById(id, {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog._id.toString(),
      blogName: blog.name,
    });
  }

  delete(id: string): Promise<boolean> {
    return this.postsRepository.deleteById(id);
  }
}
