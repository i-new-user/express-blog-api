import { Router } from 'express';
import { validateBody } from '../../common/middlewares/zod-validation.middleware';

import { authController } from './auth.controller';
import { bearerAuthMiddleware } from './guards/bearer-auth.middleware';
import { refreshTokenMiddleware } from './guards/refresh-token.middleware';

import { loginInputSchema } from './validation/login.schema';
import { registrationInputSchema } from './validation/registration.schema';
import { registrationConfirmationSchema } from './validation/registration-confirmation.schema';
import { registrationEmailResendingSchema } from './validation/registration-email-resending.schema';
import {
  passwordRecoverySchema,
  newPasswordSchema,
} from './validation/password-recovery.schema';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginInputSchema), authController.login);

authRouter.post(
  '/refresh-token',
  refreshTokenMiddleware,
  authController.refreshToken,
);

authRouter.post('/logout', refreshTokenMiddleware, authController.logout);

authRouter.get('/me', bearerAuthMiddleware, authController.me);

authRouter.post(
  '/registration',
  validateBody(registrationInputSchema),
  authController.registration,
);

authRouter.post(
  '/registration-confirmation',
  validateBody(registrationConfirmationSchema),
  authController.confirmRegistration,
);

authRouter.post(
  '/registration-email-resending',
  validateBody(registrationEmailResendingSchema),
  authController.resendRegistrationEmail,
);

authRouter.post(
  '/password-recovery',
  validateBody(passwordRecoverySchema),
  authController.passwordRecovery,
);

authRouter.post(
  '/new-password',
  validateBody(newPasswordSchema),
  authController.newPassword,
);