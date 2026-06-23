import { Router } from 'express';
import { asyncHandler } from '../../common/helpers/async-handler';
import { basicAuthMiddleware } from '../../common/middlewares/basic-auth.middleware';
import { validateBody } from '../../common/middlewares/zod-validation.middleware';
import { optionalBearerAuthMiddleware } from '../auth/guards/optional-bearer-auth.middleware';
import { postsController } from '../posts/posts.controller';
import { blogPostInputSchema } from '../posts/validation/post.schema';
import { blogsController } from './blogs.controller';
import { blogInputSchema } from './validation/blog.schema';

export const blogsRouter = Router();

blogsRouter.get('/', asyncHandler(blogsController.getBlogs));
blogsRouter.get('/:id', asyncHandler(blogsController.getBlogById));

blogsRouter.get(
  '/:blogId/posts',
  optionalBearerAuthMiddleware,
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
