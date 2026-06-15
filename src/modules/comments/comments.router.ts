import { Router } from 'express';
import { validateBody } from '../../common/middlewares/zod-validation.middleware';
import { bearerAuthMiddleware } from '../auth/guards/bearer-auth.middleware';
import { commentsController } from './comments.controller';
import { commentInputSchema } from './validation/comment.schema';

export const commentsRouter = Router();

commentsRouter.get('/:id', commentsController.getCommentById);

commentsRouter.put(
  '/:commentId',
  bearerAuthMiddleware,
  validateBody(commentInputSchema),
  commentsController.updateComment,
);

commentsRouter.delete(
  '/:commentId',
  bearerAuthMiddleware,
  commentsController.deleteComment,
);