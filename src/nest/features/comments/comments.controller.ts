import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import type { AuthenticatedRequest } from '../auth/bearer-auth.guard';
import { OptionalBearerAuthGuard } from '../auth/optional-bearer-auth.guard';
import type { OptionalAuthenticatedRequest } from '../auth/optional-bearer-auth.guard';
import { PostsRepository } from '../posts/posts.repository';
import { CommentsQueryRepository } from './comments.query-repository';
import { commentSchema, CommentDto, likeStatusSchema, LikeStatusDto } from './dto/comment.dto';
import { CreateCommentCommand, DeleteCommentCommand, UpdateCommentCommand, UpdateCommentLikeCommand } from './use-cases/comments.use-cases';

@Controller('comments')
export class CommentsController {
  constructor(private readonly queryRepository: CommentsQueryRepository, private readonly commandBus: CommandBus) {}

  @Get(':id')
  @UseGuards(OptionalBearerAuthGuard)
  async getComment(@Param('id') id: string, @Req() req: OptionalAuthenticatedRequest) {
    const comment = await this.queryRepository.findById(id, req.userId);
    if (!comment) throw new NotFoundException();
    return comment;
  }

  @Put(':commentId')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('commentId') id: string, @Req() req: AuthenticatedRequest, @Body(new ZodValidationPipe(commentSchema)) dto: CommentDto): Promise<void> {
    const result = await this.commandBus.execute(new UpdateCommentCommand(id, req.userId, dto));
    if (result === 'not-found') throw new NotFoundException();
    if (result === 'forbidden') throw new ForbiddenException();
  }

  @Delete(':commentId')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('commentId') id: string, @Req() req: AuthenticatedRequest): Promise<void> {
    const result = await this.commandBus.execute(new DeleteCommentCommand(id, req.userId));
    if (result === 'not-found') throw new NotFoundException();
    if (result === 'forbidden') throw new ForbiddenException();
  }

  @Put(':commentId/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async like(@Param('commentId') id: string, @Req() req: AuthenticatedRequest, @Body(new ZodValidationPipe(likeStatusSchema)) dto: LikeStatusDto): Promise<void> {
    if (!(await this.commandBus.execute(new UpdateCommentLikeCommand(id, req.userId, dto.likeStatus)))) throw new NotFoundException();
  }
}

@Controller('posts')
export class PostCommentsController {
  constructor(private readonly posts: PostsRepository, private readonly queryRepository: CommentsQueryRepository, private readonly commandBus: CommandBus) {}

  @Get(':postId/comments')
  @UseGuards(OptionalBearerAuthGuard)
  async getForPost(@Param('postId') postId: string, @Query() query: PaginationQueryDto, @Req() req: OptionalAuthenticatedRequest) {
    if (!(await this.posts.exists(postId))) throw new NotFoundException();
    return this.queryRepository.findByPostId(postId, query, req.userId);
  }

  @Post(':postId/comments')
  @UseGuards(BearerAuthGuard)
  async create(@Param('postId') postId: string, @Req() req: AuthenticatedRequest, @Body(new ZodValidationPipe(commentSchema)) dto: CommentDto) {
    const comment = await this.commandBus.execute(new CreateCommentCommand(postId, req.userId, dto));
    if (!comment) throw new NotFoundException();
    return comment;
  }
}
