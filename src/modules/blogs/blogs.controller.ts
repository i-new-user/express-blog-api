import { Request, Response } from 'express';
import { blogsQueryRepository } from './blogs.query-repository';
import { blogsService } from './blogs.service';
import { BlogInputDto } from './dto/blog.input-dto';

export const blogsController = {
  async getBlogs(req: Request, res: Response): Promise<void> {
    const result = await blogsQueryRepository.findBlogs(req.query);

    res.status(200).json(result);
  },

  async getBlogById(req: Request<{ id: string }>, res: Response): Promise<void> {
    const blog = await blogsQueryRepository.findBlogById(req.params.id);

    if (!blog) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json(blog);
  },

  async createBlog(req: Request<object, object, BlogInputDto>, res: Response): Promise<void> {
    const createdBlog = await blogsService.createBlog(req.body);

    res.status(201).json(createdBlog);
  },

  async updateBlog(req: Request<{ id: string }, object, BlogInputDto>, res: Response): Promise<void> {
    const isUpdated = await blogsService.updateBlog(req.params.id, req.body);

    if (!isUpdated) {
      res.sendStatus(404);
      return;
    }

    res.sendStatus(204);
  },

  async deleteBlog(req: Request<{ id: string }>, res: Response): Promise<void> {
    const isDeleted = await blogsService.deleteBlog(req.params.id);

    if (!isDeleted) {
      res.sendStatus(404);
      return;
    }

    res.sendStatus(204);
  },
};