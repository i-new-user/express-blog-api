import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from '../config/env';
import { rateLimitMiddleware } from '../common/middlewares/rate-limit.middleware';
import { globalErrorMiddleware } from '../common/middlewares/global-error.middleware';
import { authRouter } from '../modules/auth/auth.router';
import { blogsRouter } from '../modules/blogs/blogs.router';
import { commentsRouter } from '../modules/comments/comments.router';
import { postsRouter } from '../modules/posts/posts.router';
import { securityRouter } from '../modules/security/security.router';
import { testingRouter } from '../modules/testing/testing.router';
import { usersRouter } from '../modules/users/users.router';

const homeworkPrefixes = [
  '',
  '/hometask_07/api',
  '/hometask_08/api',
  '/hometask_09/api',
  '/hometask_10/api',
  '/hometask_11/api',
  '/hometask_12/api',
] as const;

const authRateLimitedPaths = [
  '/auth/login',
  '/auth/registration',
  '/auth/registration-confirmation',
  '/auth/registration-email-resending',
  '/auth/password-recovery',
  '/auth/new-password',
] as const;

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
  res.status(200).json({ message: 'API is running' });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

const rateLimitedRoutes = homeworkPrefixes.flatMap((prefix) =>
  authRateLimitedPaths.map((path) => `${prefix}${path}`),
);

app.use(rateLimitedRoutes, rateLimitMiddleware);

for (const prefix of homeworkPrefixes) {
  app.use(`${prefix}/blogs`, blogsRouter);
  app.use(`${prefix}/posts`, postsRouter);
  app.use(`${prefix}/users`, usersRouter);
  app.use(`${prefix}/auth`, authRouter);
  app.use(`${prefix}/comments`, commentsRouter);
  app.use(`${prefix}/testing`, testingRouter);
  app.use(`${prefix}/security`, securityRouter);
}

app.use(globalErrorMiddleware);
