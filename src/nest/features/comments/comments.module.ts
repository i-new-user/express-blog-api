import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from '../posts/posts.module';
import {
  CommentsController,
  PostCommentsController,
} from './comments.controller';
import { CommentsQueryRepository } from './comments.query-repository';
import { CommentEntity, CommentSchema } from './domain/comment.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CommentsRepository } from './comments.repository';
import { COMMENT_COMMAND_HANDLERS } from './use-cases/comments.use-cases';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: CommentEntity.name, schema: CommentSchema },
    ]),
    PostsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [CommentsController, PostCommentsController],
  providers: [CommentsRepository, CommentsQueryRepository, ...COMMENT_COMMAND_HANDLERS],
})
export class CommentsModule {}
