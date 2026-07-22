import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CreateBlogPostDto, CreatePostDto } from './dto/post.dto';
import { PostsQueryRepository } from './posts.query-repository';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  getPosts(@Query() query: PaginationQueryDto) {
    return this.postsQueryRepository.findAll(query);
  }

  @Post()
  async createPost(@Body() dto: CreatePostDto) {
    const post = await this.postsService.create(dto);

    if (!post) {
      throw new BadRequestException();
    }

    return post;
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    const post = await this.postsQueryRepository.findById(id);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() dto: CreatePostDto,
  ): Promise<void> {
    if (!(await this.postsService.update(id, dto))) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    if (!(await this.postsService.delete(id))) {
      throw new NotFoundException();
    }
  }
}

@Controller('blogs')
export class BlogPostsController {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: PaginationQueryDto,
  ) {
    if (!(await this.blogsRepository.findById(blogId))) {
      throw new NotFoundException();
    }

    return this.postsQueryRepository.findByBlogId(blogId, query);
  }

  @Post(':blogId/posts')
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() dto: CreateBlogPostDto,
  ) {
    const post = await this.postsService.createForBlog(blogId, dto);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }
}
