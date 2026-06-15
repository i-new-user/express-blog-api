import { Router } from 'express';
import { authController } from './auth.controller';
import { bearerAuthMiddleware } from './guards/bearer-auth.middleware';
import { validateBody } from '../../common/middlewares/zod-validation.middleware';
import { loginInputSchema } from './validation/login.schema';
import { registrationInputSchema } from './validation/registration.schema';
import { registrationConfirmationSchema } from './validation/registration-confirmation.schema';
import { registrationEmailResendingSchema } from './validation/registration-email-resending.schema';
import { asyncHandler } from '../../common/helpers/async-handler';

export const authRouter = Router();

authRouter.post(
  '/login',
  validateBody(loginInputSchema),
  asyncHandler(authController.login),
);

authRouter.get(
  '/me',
  bearerAuthMiddleware,
  asyncHandler(authController.me),
);

authRouter.post(
  '/registration',
  validateBody(registrationInputSchema),
  asyncHandler(authController.registration),
);

authRouter.post(
  '/registration-confirmation',
  validateBody(registrationConfirmationSchema),
  asyncHandler(authController.registrationConfirmation),
);

authRouter.post(
  '/registration-email-resending',
  validateBody(registrationEmailResendingSchema),
  asyncHandler(authController.registrationEmailResending),
);