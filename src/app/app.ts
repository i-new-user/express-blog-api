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

    '/hometask_09/api/auth/login',
    '/hometask_09/api/auth/registration',
    '/hometask_09/api/auth/registration-confirmation',
    '/hometask_09/api/auth/registration-email-resending',
  ],
  rateLimitMiddleware,
);



const h07Prefix = '/hometask_07/api';
const h08Prefix = '/hometask_08/api';
const h09Prefix = '/hometask_09/api';

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

app.use(globalErrorMiddleware);