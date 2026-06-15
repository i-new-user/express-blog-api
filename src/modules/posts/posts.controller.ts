import { Request, Response } from 'express';
import { blogsRepository } from '../blogs/blogs.repository';
import { BlogPostInputDto, PostInputDto } from './dto/post.input-dto';
import { postsQueryRepository } from './posts.query-repository';
import { postsService } from './posts.service';

export const postsController = {
  async getPosts(req: Request, res: Response): Promise<void> {
    const result = await postsQueryRepository.findPosts(req.query);

    res.status(200).json(result);
  },

  async getPostById(req: Request<{ id: string }>, res: Response): Promise<void> {
    const post = await postsQueryRepository.findPostById(req.params.id);

    if (!post) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json(post);
  },

  async createPost(
    req: Request<object, object, PostInputDto>,
    res: Response,
  ): Promise<void> {
    const createdPost = await postsService.createPost(req.body);

    if (!createdPost) {
      res.sendStatus(400);
      return;
    }

    res.status(201).json(createdPost);
  },

  async updatePost(
    req: Request<{ id: string }, object, PostInputDto>,
    res: Response,
  ): Promise<void> {
    const result = await postsService.updatePost(req.params.id, req.body);

    if (result.status === 'not-found') {
      res.sendStatus(404);
      return;
    }

    res.sendStatus(204);
  },

  async deletePost(req: Request<{ id: string }>, res: Response): Promise<void> {
    const result = await postsService.deletePost(req.params.id);

    if (result.status === 'not-found') {
      res.sendStatus(404);
      return;
    }

    res.sendStatus(204);
  },

  async getPostsByBlogId(
    req: Request<{ blogId: string }>,
    res: Response,
  ): Promise<void> {
    const blog = await blogsRepository.findBlogById(req.params.blogId);

    if (!blog) {
      res.sendStatus(404);
      return;
    }

    const result = await postsQueryRepository.findPostsByBlogId(
      req.params.blogId,
      req.query,
    );

    res.status(200).json(result);
  },

  async createPostForBlog(
    req: Request<{ blogId: string }, object, BlogPostInputDto>,
    res: Response,
  ): Promise<void> {
    const createdPost = await postsService.createPostForBlog(
      req.params.blogId,
      req.body,
    );

    if (!createdPost) {
      res.sendStatus(404);
      return;
    }

    res.status(201).json(createdPost);
  },
};