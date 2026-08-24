import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './blogs.controller';
import { BlogsQueryRepository } from './blogs.query-repository';
import { BlogsRepository } from './blogs.repository';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';
import { BLOG_COMMAND_HANDLERS } from './use-cases/blogs.use-cases';
import { Blog, BlogSchema } from './domain/blog.schema';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [BlogsController],
  providers: [BlogsRepository, BlogsQueryRepository, BasicAuthGuard, ...BLOG_COMMAND_HANDLERS],
  exports: [BlogsRepository],
})
export class BlogsModule {}
