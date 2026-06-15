import { ObjectId } from 'mongodb';
import {
  buildPaginatedView,
  getPaginationParams,
} from '../../common/helpers/pagination.helper';
import { PaginationQuery } from '../../common/types/pagination.types';
import { getDb } from '../../db/mongo-client';
import { PostDbModel } from './domain/post.entity';
import { PostViewDto } from './dto/post.view-dto';

const getPostsCollection = () => getDb().collection<PostDbModel>('posts');

export const mapPostToView = (post: PostDbModel): PostViewDto => ({
  id: post._id.toString(),
  title: post.title,
  shortDescription: post.shortDescription,
  content: post.content,
  blogId: post.blogId,
  blogName: post.blogName,
  createdAt: post.createdAt,
});

export const postsQueryRepository = {
  async findPostById(id: string): Promise<PostViewDto | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const post = await getPostsCollection().findOne({
      _id: new ObjectId(id),
    });

    return post ? mapPostToView(post) : null;
  },

  async findPosts(query: PaginationQuery) {
    const pagination = getPaginationParams(query);

    const totalCount = await getPostsCollection().countDocuments({});

    const posts = await getPostsCollection()
      .find({})
      .sort({ [pagination.sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .toArray();

    return buildPaginatedView({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: posts.map(mapPostToView),
    });
  },

  async findPostsByBlogId(blogId: string, query: PaginationQuery) {
    const pagination = getPaginationParams(query);

    const filter = { blogId };

    const totalCount = await getPostsCollection().countDocuments(filter);

    const posts = await getPostsCollection()
      .find(filter)
      .sort({ [pagination.sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .toArray();

    return buildPaginatedView({
      totalCount,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      items: posts.map(mapPostToView),
    });
  },
};