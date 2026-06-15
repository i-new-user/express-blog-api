import { Router } from 'express';
import { validateBody } from '../../common/middlewares/zod-validation.middleware';
import { loginInputSchema } from './validation/login.schema';
import { authController } from './auth.controller';
import { bearerAuthMiddleware } from './guards/bearer-auth.middleware';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginInputSchema), authController.login);

authRouter.get('/me', bearerAuthMiddleware, authController.me);