import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, QueryFilter } from 'mongoose';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../../common/helpers/pagination.helper';
import { getAllowedSortBy } from '../../../common/helpers/query.helper';
import { PostViewDto } from '../../../modules/posts/dto/post.view-dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PostEntity } from './domain/post.schema';
import { mapPostToView } from './posts.mapper';

const allowedSortFields = [
  'createdAt',
  'title',
  'shortDescription',
  'content',
  'blogId',
  'blogName',
] as const;
type PostSortField = (typeof allowedSortFields)[number];

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostEntity.name)
    private readonly postModel: Model<PostEntity>,
  ) {}

  async findById(id: string, userId?: string): Promise<PostViewDto | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const post = await this.postModel.findById(id).lean<PostEntity>();
    return post ? mapPostToView(post, userId) : null;
  }

  findAll(query: PaginationQueryDto, userId?: string) {
    return this.findByFilter({}, query, userId);
  }

  findByBlogId(blogId: string, query: PaginationQueryDto, userId?: string) {
    return this.findByFilter({ blogId }, query, userId);
  }

  private async findByFilter(
    filter: QueryFilter<PostEntity>,
    query: PaginationQueryDto,
    userId?: string,
  ) {
    const pagination = getPaginationParams(query);
    const sortBy = getAllowedSortBy<PostSortField>(
      pagination.sortBy,
      allowedSortFields,
      'createdAt',
    );
    const [totalCount, posts] = await Promise.all([
      this.postModel.countDocuments(filter),
      this.postModel
        .find(filter)
        .sort({ [sortBy]: pagination.sortDirection })
        .skip(pagination.skip)
        .limit(pagination.pageSize)
        .lean<PostEntity[]>(),
    ]);

    return buildPaginatedView<PostViewDto>({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: posts.map((post) => mapPostToView(post, userId)),
    });
  }
}
