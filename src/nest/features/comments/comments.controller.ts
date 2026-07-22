import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PostsRepository } from '../posts/posts.repository';
import { CommentsQueryRepository } from './comments.query-repository';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  async getComment(@Param('id') id: string) {
    const comment = await this.commentsQueryRepository.findById(id);

    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }
}

@Controller('posts')
export class PostCommentsController {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':postId/comments')
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Query() query: PaginationQueryDto,
  ) {
    if (!(await this.postsRepository.exists(postId))) {
      throw new NotFoundException();
    }

    return this.commentsQueryRepository.findByPostId(postId, query);
  }
}
