import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from '../blogs/blogs.module';
import { PostEntity, PostSchema } from './domain/post.schema';
import { BlogPostsController, PostsController } from './posts.controller';
import { PostsQueryRepository } from './posts.query-repository';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostEntity.name, schema: PostSchema },
    ]),
    BlogsModule,
  ],
  controllers: [PostsController, BlogPostsController],
  providers: [PostsService, PostsRepository, PostsQueryRepository],
  exports: [PostsRepository],
})
export class PostsModule {}
