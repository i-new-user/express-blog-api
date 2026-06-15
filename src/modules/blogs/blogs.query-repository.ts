import { ObjectId, SortDirection } from 'mongodb';
import { getDb } from '../../db/mongo-client';
import { BlogDbModel } from './domain/blog.entity';
import { BlogViewDto } from './dto/blog.view-dto';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../common/helpers/pagination.helper';

const getBlogsCollection = () => getDb().collection<BlogDbModel>('blogs');

const mapBlogToView = (blog: BlogDbModel): BlogViewDto => ({
  id: blog._id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});

export const blogsQueryRepository = {
  async findBlogById(id: string): Promise<BlogViewDto | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const blog = await getBlogsCollection().findOne({
      _id: new ObjectId(id),
    });

    return blog ? mapBlogToView(blog) : null;
  },

async findBlogs(query: {
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: string;
  pageSize?: string;
}) {
  const pagination = getPaginationParams(query);

  const filter = query.searchNameTerm
    ? { name: { $regex: query.searchNameTerm, $options: 'i' } }
    : {};

  const totalCount = await getBlogsCollection().countDocuments(filter);

  const blogs = await getBlogsCollection()
    .find(filter)
    .sort({ [pagination.sortBy]: pagination.sortDirection })
    .skip(pagination.skip)
    .limit(pagination.pageSize)
    .toArray();

  return buildPaginatedView({
    totalCount,
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
    items: blogs.map(mapBlogToView),
  });
}
};