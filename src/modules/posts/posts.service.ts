import { ObjectId } from 'mongodb';
import { blogsRepository } from '../blogs/blogs.repository';
import { LikeStatus } from '../comments/domain/comment.entity';
import { usersRepository } from '../users/users.repository';
import { PostDbModel } from './domain/post.entity';
import { BlogPostInputDto, PostInputDto } from './dto/post.input-dto';
import { PostViewDto } from './dto/post.view-dto';
import { mapPostToView } from './posts.mapper';
import { postsRepository } from './posts.repository';

type PostMutationResult =
  | { status: 'success' }
  | { status: 'not-found' };

export const postsService = {
  async createPost(input: PostInputDto, userId?: string): Promise<PostViewDto | null> {
    const blog = await blogsRepository.findBlogById(input.blogId);

    if (!blog) {
      return null;
    }

    const newPost: PostDbModel = {
      _id: new ObjectId(),
      title: input.title,
      shortDescription: input.shortDescription,
      content: input.content,
      blogId: blog._id.toString(),
      blogName: blog.name,
      createdAt: new Date().toISOString(),
      likes: [],
    };

    await postsRepository.createPost(newPost);

    return mapPostToView(newPost, userId);
  },

  async createPostForBlog(
    blogId: string,
    input: BlogPostInputDto,
    userId?: string,
  ): Promise<PostViewDto | null> {
    return this.createPost(
      {
        ...input,
        blogId,
      },
      userId,
    );
  },

  async updatePost(
    id: string,
    input: PostInputDto,
  ): Promise<PostMutationResult> {
    const blog = await blogsRepository.findBlogById(input.blogId);

    if (!blog) {
      return { status: 'not-found' };
    }

    const isUpdated = await postsRepository.updatePost(id, {
      title: input.title,
      shortDescription: input.shortDescription,
      content: input.content,
      blogId: blog._id.toString(),
      blogName: blog.name,
    });

    return isUpdated ? { status: 'success' } : { status: 'not-found' };
  },

  async updateLikeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<PostMutationResult> {
    const post = await postsRepository.findPostById(postId);

    if (!post) {
      return { status: 'not-found' };
    }

    const user = await usersRepository.findById(userId);

    if (!user) {
      return { status: 'not-found' };
    }

    await postsRepository.updateLikeStatus(
      postId,
      user._id.toString(),
      user.login,
      likeStatus,
    );

    return { status: 'success' };
  },

  async deletePost(id: string): Promise<PostMutationResult> {
    const isDeleted = await postsRepository.deletePost(id);

    return isDeleted ? { status: 'success' } : { status: 'not-found' };
  },
};
