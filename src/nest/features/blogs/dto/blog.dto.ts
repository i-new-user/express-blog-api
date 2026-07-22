import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class CreateBlogDto {
  name!: string;
  description!: string;
  websiteUrl!: string;
}

export class BlogsQueryDto extends PaginationQueryDto {
  searchNameTerm?: string;
}
