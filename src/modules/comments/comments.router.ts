import { Router } from 'express';
import { validateBody } from '../../common/middlewares/zod-validation.middleware';
import { bearerAuthMiddleware } from '../auth/guards/bearer-auth.middleware';
import { commentsController } from './comments.controller';
import { commentInputSchema } from './validation/comment.schema';
import { asyncHandler } from '../../common/helpers/async-handler';

export const commentsRouter = Router();

commentsRouter.get(
  '/:id',
  asyncHandler(commentsController.getCommentById),
);

commentsRouter.put(
  '/:commentId',
  bearerAuthMiddleware,
  validateBody(commentInputSchema),
  asyncHandler(commentsController.updateComment),
);

commentsRouter.delete(
  '/:commentId',
  bearerAuthMiddleware,
  asyncHandler(commentsController.deleteComment),
);