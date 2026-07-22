import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, QueryFilter } from 'mongoose';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../../common/helpers/pagination.helper';
import {
  escapeRegex,
  getAllowedSortBy,
} from '../../../common/helpers/query.helper';
import { BlogViewDto } from '../../../modules/blogs/dto/blog.viewDto';
import { mapBlogToView } from './blogs.mapper';
import { BlogsQueryDto } from './dto/blog.dto';
import { Blog } from './domain/blog.schema';

const allowedSortFields = [
  'createdAt',
  'name',
  'description',
  'websiteUrl',
  'isMembership',
] as const;
type BlogSortField = (typeof allowedSortFields)[number];

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: Model<Blog>,
  ) {}

  async findById(id: string): Promise<BlogViewDto | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const blog = await this.blogModel.findById(id).lean<Blog>();
    return blog ? mapBlogToView(blog) : null;
  }

  async findAll(query: BlogsQueryDto) {
    const pagination = getPaginationParams(query);
    const sortBy = getAllowedSortBy<BlogSortField>(
      pagination.sortBy,
      allowedSortFields,
      'createdAt',
    );
    const filter: QueryFilter<Blog> = query.searchNameTerm
      ? { name: { $regex: escapeRegex(query.searchNameTerm), $options: 'i' } }
      : {};

    const [totalCount, blogs] = await Promise.all([
      this.blogModel.countDocuments(filter),
      this.blogModel
        .find(filter)
        .sort({ [sortBy]: pagination.sortDirection })
        .skip(pagination.skip)
        .limit(pagination.pageSize)
        .lean<Blog[]>(),
    ]);

    return buildPaginatedView<BlogViewDto>({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: blogs.map(mapBlogToView),
    });
  }
}
