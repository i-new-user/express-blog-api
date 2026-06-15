import { Router } from 'express';
import { basicAuthMiddleware } from '../../common/middlewares/basic-auth.middleware';
import { validateBody } from '../../common/middlewares/zod-validation.middleware';
import { bearerAuthMiddleware } from '../auth/guards/bearer-auth.middleware';
import { commentsController } from '../comments/comments.controller';
import { commentInputSchema } from '../comments/validation/comment.schema';
import { postsController } from './posts.controller';
import { postInputSchema } from './validation/post.schema';

export const postsRouter = Router();

postsRouter.get('/', postsController.getPosts);
postsRouter.get('/:id', postsController.getPostById);

postsRouter.get(
  '/:postId/comments',
  commentsController.getCommentsByPostId,
);

postsRouter.post(
  '/:postId/comments',
  bearerAuthMiddleware,
  validateBody(commentInputSchema),
  commentsController.createCommentForPost,
);

postsRouter.post(
  '/',
  basicAuthMiddleware,
  validateBody(postInputSchema),
  postsController.createPost,
);

postsRouter.put(
  '/:id',
  basicAuthMiddleware,
  validateBody(postInputSchema),
  postsController.updatePost,
);

postsRouter.delete('/:id', basicAuthMiddleware, postsController.deletePost);