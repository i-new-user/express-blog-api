import { ObjectId } from 'mongodb';
import { blogsRepository } from '../blogs/blogs.repository';
import { PostDbModel } from './domain/post.entity';
import { BlogPostInputDto, PostInputDto } from './dto/post.input-dto';
import { PostViewDto } from './dto/post.view-dto';
import { postsRepository } from './posts.repository';

/**
 * PostsService — слой бизнес-логики для постов.
 *
 * Главная бизнес-логика:
 * пост нельзя создать без существующего блога.
 */
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

    return {
      id: newPost._id.toString(),
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      blogId: newPost.blogId,
      blogName: newPost.blogName,
      createdAt: newPost.createdAt,
    };
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

  async updatePost(id: string, input: PostInputDto): Promise<boolean | null> {
    const blog = await blogsRepository.findBlogById(input.blogId);

    if (!blog) {
      return null;
    }

    return postsRepository.updatePost(id, {
      title: input.title,
      shortDescription: input.shortDescription,
      content: input.content,
      blogId: blog._id.toString(),
      blogName: blog.name,
    });
  },

  async deletePost(id: string): Promise<boolean> {
    return postsRepository.deletePost(id);
  },
};