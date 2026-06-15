import { Router } from 'express';
import { usersController } from './users.controller';
import { basicAuthMiddleware } from '../../common/middlewares/basic-auth.middleware';
import { validateBody } from '../../common/middlewares/zod-validation.middleware';
import { userInputSchema } from './validation/user.schema';

export const usersRouter = Router();

usersRouter.get(
  '/',
  basicAuthMiddleware,
  usersController.getUsers,
);

usersRouter.post(
  '/',
  basicAuthMiddleware,
  validateBody(userInputSchema),
  usersController.createUser,
);

usersRouter.delete(
  '/:id',
  basicAuthMiddleware,
  usersController.deleteUser,
);