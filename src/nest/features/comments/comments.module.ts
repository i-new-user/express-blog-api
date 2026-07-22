import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from '../posts/posts.module';
import {
  CommentsController,
  PostCommentsController,
} from './comments.controller';
import { CommentsQueryRepository } from './comments.query-repository';
import { CommentEntity, CommentSchema } from './domain/comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommentEntity.name, schema: CommentSchema },
    ]),
    PostsModule,
  ],
  controllers: [CommentsController, PostCommentsController],
  providers: [CommentsQueryRepository],
})
export class CommentsModule {}
