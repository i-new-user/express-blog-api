import { Router } from 'express';
import { blogsController } from './blogs.controller';
import { validateBody } from '../../common/middlewares/zod-validation.middleware';
import { blogInputSchema } from './validation/blog.schema';
import { basicAuthMiddleware } from '../../common/middlewares/basic-auth.middleware';
import { postsController } from '../posts/posts.controller';
import { blogPostInputSchema } from '../posts/validation/post.schema';

export const blogsRouter = Router();

blogsRouter.get('/', blogsController.getBlogs);
blogsRouter.get('/:id', blogsController.getBlogById);

blogsRouter.get('/:blogId/posts', postsController.getPostsByBlogId);

blogsRouter.post(
  '/',
  basicAuthMiddleware,
  validateBody(blogInputSchema),
  blogsController.createBlog,
);

blogsRouter.post(
  '/:blogId/posts',
  basicAuthMiddleware,
  validateBody(blogPostInputSchema),
  postsController.createPostForBlog,
);

blogsRouter.put(
  '/:id',
  basicAuthMiddleware,
  validateBody(blogInputSchema),
  blogsController.updateBlog,
);

blogsRouter.delete('/:id', basicAuthMiddleware, blogsController.deleteBlog);