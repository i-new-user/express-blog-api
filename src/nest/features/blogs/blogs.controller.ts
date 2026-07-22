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
} from '@nestjs/common';
import { BlogsQueryRepository } from './blogs.query-repository';
import { BlogsService } from './blogs.service';
import { BlogsQueryDto, CreateBlogDto } from './dto/blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  getBlogs(@Query() query: BlogsQueryDto) {
    return this.blogsQueryRepository.findAll(query);
  }

  @Post()
  createBlog(@Body() dto: CreateBlogDto) {
    return this.blogsService.create(dto);
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() dto: CreateBlogDto,
  ): Promise<void> {
    if (!(await this.blogsService.update(id, dto))) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    if (!(await this.blogsService.delete(id))) {
      throw new NotFoundException();
    }
  }
}
