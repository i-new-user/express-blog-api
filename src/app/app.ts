import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from '../config/env';

import { blogsRouter } from '../modules/blogs/blogs.router';
import { postsRouter } from '../modules/posts/posts.router';
import { usersRouter } from '../modules/users/users.router';
import { authRouter } from '../modules/auth/auth.router';
import { commentsRouter } from '../modules/comments/comments.router';
import { securityRouter } from '../modules/security/security.router';

import { rateLimitMiddleware } from '../common/middlewares/rate-limit.middleware';

import { testingRouter } from '../modules/testing/testing.router';
import { globalErrorMiddleware } from '../common/middlewares/global-error.middleware';

export const app = express();

app.set('trust proxy', true);

app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'API is running',
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

app.use(
  [
    '/auth/login',
    '/auth/registration',
    '/auth/registration-confirmation',
    '/auth/registration-email-resending',
    '/auth/password-recovery',
    '/auth/new-password',

    '/hometask_09/api/auth/login',
    '/hometask_09/api/auth/registration',
    '/hometask_09/api/auth/registration-confirmation',
    '/hometask_09/api/auth/registration-email-resending',
    '/hometask_09/api/auth/password-recovery',
    '/hometask_09/api/auth/new-password',

    '/hometask_10/api/auth/login',
    '/hometask_10/api/auth/registration',
    '/hometask_10/api/auth/registration-confirmation',
    '/hometask_10/api/auth/registration-email-resending',
    '/hometask_10/api/auth/password-recovery',
    '/hometask_10/api/auth/new-password',

    '/hometask_11/api/auth/login',
    '/hometask_11/api/auth/registration',
    '/hometask_11/api/auth/registration-confirmation',
    '/hometask_11/api/auth/registration-email-resending',
    '/hometask_11/api/auth/password-recovery',
    '/hometask_11/api/auth/new-password',

    '/hometask_12/api/auth/login',
    '/hometask_12/api/auth/registration',
    '/hometask_12/api/auth/registration-confirmation',
    '/hometask_12/api/auth/registration-email-resending',
    '/hometask_12/api/auth/password-recovery',
    '/hometask_12/api/auth/new-password',
  ],
  rateLimitMiddleware,
);

const h07Prefix = '/hometask_07/api';
const h08Prefix = '/hometask_08/api';
const h09Prefix = '/hometask_09/api';
const h10Prefix = '/hometask_10/api';
const h11Prefix = '/hometask_11/api';
const h12Prefix = '/hometask_12/api';

const registerRoutes = (prefix: string) => {
  app.use(`${prefix}/blogs`, blogsRouter);
  app.use(`${prefix}/posts`, postsRouter);
  app.use(`${prefix}/users`, usersRouter);
  app.use(`${prefix}/auth`, authRouter);
  app.use(`${prefix}/comments`, commentsRouter);
  app.use(`${prefix}/testing`, testingRouter);

  if (prefix) {
    app.use(`${prefix}/security`, securityRouter);
  } else {
    app.use('/security', securityRouter);
  }
};

registerRoutes('');
registerRoutes(h07Prefix);
registerRoutes(h08Prefix);
registerRoutes(h09Prefix);
registerRoutes(h10Prefix);
registerRoutes(h11Prefix);
registerRoutes(h12Prefix);

app.use(globalErrorMiddleware);