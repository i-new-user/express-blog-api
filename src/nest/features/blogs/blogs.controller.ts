import {
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
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { BlogsQueryRepository } from './blogs.query-repository';
import { BlogsQueryDto, createBlogSchema, CreateBlogDto } from './dto/blog.dto';
import { CreateBlogCommand, DeleteBlogCommand, UpdateBlogCommand } from './use-cases/blogs.use-cases';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  getBlogs(@Query() query: BlogsQueryDto) {
    return this.blogsQueryRepository.findAll(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  createBlog(@Body(new ZodValidationPipe(createBlogSchema)) dto: CreateBlogDto) {
    return this.commandBus.execute(new CreateBlogCommand(dto));
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.findById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createBlogSchema)) dto: CreateBlogDto,
  ): Promise<void> {
    if (!(await this.commandBus.execute(new UpdateBlogCommand(id, dto)))) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    if (!(await this.commandBus.execute(new DeleteBlogCommand(id)))) {
      throw new NotFoundException();
    }
  }
}
