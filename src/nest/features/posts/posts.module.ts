import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from '../blogs/blogs.module';
import { PostEntity, PostSchema } from './domain/post.schema';
import { BlogPostsController, PostsController } from './posts.controller';
import { PostsQueryRepository } from './posts.query-repository';
import { PostsRepository } from './posts.repository';
import { UsersModule } from '../users/users.module';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';
import { AuthModule } from '../auth/auth.module';
import { POST_COMMAND_HANDLERS } from './use-cases/posts.use-cases';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: PostEntity.name, schema: PostSchema },
    ]),
    BlogsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [PostsController, BlogPostsController],
  providers: [PostsRepository, PostsQueryRepository, BasicAuthGuard, ...POST_COMMAND_HANDLERS],
  exports: [PostsRepository],
})
export class PostsModule {}
