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
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import type { AuthenticatedRequest } from '../auth/bearer-auth.guard';
import { OptionalBearerAuthGuard } from '../auth/optional-bearer-auth.guard';
import type { OptionalAuthenticatedRequest } from '../auth/optional-bearer-auth.guard';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BlogsRepository } from '../blogs/blogs.repository';
import { createBlogPostSchema, CreateBlogPostDto, createPostSchema, CreatePostDto } from './dto/post.dto';
import { PostsQueryRepository } from './posts.query-repository';
import { commentLikeStatusSchema } from '../../../modules/comments/validation/validation-like.schema';
import type { CommentLikeStatusInputDto } from '../../../modules/comments/validation/validation-like.schema';
import { CreateBlogPostCommand, CreatePostCommand, DeletePostCommand, UpdatePostCommand, UpdatePostLikeCommand } from './use-cases/posts.use-cases';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  @UseGuards(OptionalBearerAuthGuard)
  getPosts(@Query() query: PaginationQueryDto, @Req() req: OptionalAuthenticatedRequest) {
    return this.postsQueryRepository.findAll(query, req.userId);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(@Body(new ZodValidationPipe(createPostSchema)) dto: CreatePostDto) {
    const post = await this.commandBus.execute(new CreatePostCommand(dto));

    if (!post) {
      throw new BadRequestException();
    }

    return post;
  }

  @Get(':id')
  @UseGuards(OptionalBearerAuthGuard)
  async getPost(@Param('id') id: string, @Req() req: OptionalAuthenticatedRequest) {
    const post = await this.postsQueryRepository.findById(id, req.userId);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createPostSchema)) dto: CreatePostDto,
  ): Promise<void> {
    const result = await this.commandBus.execute(new UpdatePostCommand(id, dto));
    if (result !== 'success') {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    if (!(await this.commandBus.execute(new DeletePostCommand(id)))) {
      throw new NotFoundException();
    }
  }

  @Put(':postId/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(@Param('postId') postId: string, @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(commentLikeStatusSchema)) dto: CommentLikeStatusInputDto): Promise<void> {
    if (!(await this.commandBus.execute(new UpdatePostLikeCommand(postId, req.userId, dto.likeStatus)))) throw new NotFoundException();
  }
}

@Controller('blogs')
export class BlogPostsController {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get(':blogId/posts')
  @UseGuards(OptionalBearerAuthGuard)
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: PaginationQueryDto,
    @Req() req: OptionalAuthenticatedRequest,
  ) {
    if (!(await this.blogsRepository.findById(blogId))) {
      throw new NotFoundException();
    }

    return this.postsQueryRepository.findByBlogId(blogId, query, req.userId);
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body(new ZodValidationPipe(createBlogPostSchema)) dto: CreateBlogPostDto,
  ) {
    const post = await this.commandBus.execute(new CreateBlogPostCommand(blogId, dto));

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }
}
