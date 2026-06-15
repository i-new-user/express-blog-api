import { Router } from 'express';
import { usersController } from './users.controller';
import { basicAuthMiddleware } from '../../common/middlewares/basic-auth.middleware';
import { validateBody } from '../../common/middlewares/zod-validation.middleware';
import { userInputSchema } from './validation/user.schema';
import { asyncHandler } from '../../common/helpers/async-handler';

export const usersRouter = Router();

usersRouter.get(
  '/',
  basicAuthMiddleware,
  asyncHandler(usersController.getUsers),
);

usersRouter.post(
  '/',
  basicAuthMiddleware,
  validateBody(userInputSchema),
  asyncHandler(usersController.createUser),
);

usersRouter.delete(
  '/:id',
  basicAuthMiddleware,
  asyncHandler(usersController.deleteUser),
);