import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { z } from 'zod';

export const createBlogSchema = z.object({
  name: z.string().trim().min(1).max(15),
  description: z.string().trim().min(1).max(500),
  websiteUrl: z.string().trim().min(1).max(100).url(),
});

export class CreateBlogDto {
  name!: string;
  description!: string;
  websiteUrl!: string;
}

export class BlogsQueryDto extends PaginationQueryDto {
  searchNameTerm?: string;
}
