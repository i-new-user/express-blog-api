import { Router } from 'express';
import { asyncHandler } from '../../common/helpers/async-handler';
import { basicAuthMiddleware } from '../../common/middlewares/basic-auth.middleware';
import { validateBody } from '../../common/middlewares/zod-validation.middleware';
import { bearerAuthMiddleware } from '../auth/guards/bearer-auth.middleware';
import { optionalBearerAuthMiddleware } from '../auth/guards/optional-bearer-auth.middleware';
import { commentsController } from '../comments/comments.controller';
import { commentInputSchema } from '../comments/validation/comment.schema';
import { commentLikeStatusSchema } from '../comments/validation/validation-like.schema';
import { postsController } from './posts.controller';
import { postInputSchema } from './validation/post.schema';

export const postsRouter = Router();

postsRouter.get(
  '/',
  optionalBearerAuthMiddleware,
  asyncHandler(postsController.getPosts),
);

postsRouter.get(
  '/:postId/comments',
  optionalBearerAuthMiddleware,
  asyncHandler(commentsController.getCommentsByPostId),
);

postsRouter.post(
  '/:postId/comments',
  bearerAuthMiddleware,
  validateBody(commentInputSchema),
  asyncHandler(commentsController.createCommentForPost),
);

postsRouter.put(
  '/:postId/like-status',
  bearerAuthMiddleware,
  validateBody(commentLikeStatusSchema),
  asyncHandler(postsController.updateLikeStatus),
);

postsRouter.get(
  '/:id',
  optionalBearerAuthMiddleware,
  asyncHandler(postsController.getPostById),
);

postsRouter.post(
  '/',
  basicAuthMiddleware,
  validateBody(postInputSchema),
  asyncHandler(postsController.createPost),
);

postsRouter.put(
  '/:id',
  basicAuthMiddleware,
  validateBody(postInputSchema),
  asyncHandler(postsController.updatePost),
);

postsRouter.delete(
  '/:id',
  basicAuthMiddleware,
  asyncHandler(postsController.deletePost),
);
