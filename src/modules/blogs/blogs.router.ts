import { Router } from 'express';
import { blogsController } from './blogs.controller';
import { validateBody } from '../../common/middlewares/zod-validation.middleware';
import { blogInputSchema } from './validation/blog.schema';
import { basicAuthMiddleware } from '../../common/middlewares/basic-auth.middleware';
import { postsController } from '../posts/posts.controller';
import { blogPostInputSchema } from '../posts/validation/post.schema';
import { asyncHandler } from '../../common/helpers/async-handler';

export const blogsRouter = Router();

blogsRouter.get('/', asyncHandler(blogsController.getBlogs));
blogsRouter.get('/:id', asyncHandler(blogsController.getBlogById));

blogsRouter.get(
  '/:blogId/posts',
  asyncHandler(postsController.getPostsByBlogId),
);

blogsRouter.post(
  '/',
  basicAuthMiddleware,
  validateBody(blogInputSchema),
  asyncHandler(blogsController.createBlog),
);

blogsRouter.post(
  '/:blogId/posts',
  basicAuthMiddleware,
  validateBody(blogPostInputSchema),
  asyncHandler(postsController.createPostForBlog),
);

blogsRouter.put(
  '/:id',
  basicAuthMiddleware,
  validateBody(blogInputSchema),
  asyncHandler(blogsController.updateBlog),
);

blogsRouter.delete(
  '/:id',
  basicAuthMiddleware,
  asyncHandler(blogsController.deleteBlog),
);