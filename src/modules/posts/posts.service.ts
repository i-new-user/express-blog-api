import { ObjectId } from 'mongodb';
import { blogsRepository } from '../blogs/blogs.repository';
import { PostDbModel } from './domain/post.entity';
import { BlogPostInputDto, PostInputDto } from './dto/post.input-dto';
import { PostViewDto } from './dto/post.view-dto';
import { postsRepository } from './posts.repository';
import { mapPostToView } from './posts.mapper';

type PostMutationResult =
  | { status: 'success' }
  | { status: 'not-found' };

export const postsService = {
  async createPost(input: PostInputDto): Promise<PostViewDto | null> {
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
    };

    await postsRepository.createPost(newPost);

    return mapPostToView(newPost);
  },

  async createPostForBlog(
    blogId: string,
    input: BlogPostInputDto,
  ): Promise<PostViewDto | null> {
    return this.createPost({
      ...input,
      blogId,
    });
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

  async deletePost(id: string): Promise<PostMutationResult> {
    const isDeleted = await postsRepository.deletePost(id);

    return isDeleted ? { status: 'success' } : { status: 'not-found' };
  },
};