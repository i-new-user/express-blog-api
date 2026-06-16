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

const apiPrefix = '/hometask_09/api';

app.use('/blogs', blogsRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/comments', commentsRouter);
app.use('/security', securityRouter);
app.use('/testing', testingRouter);

app.use(`${apiPrefix}/blogs`, blogsRouter);
app.use(`${apiPrefix}/posts`, postsRouter);
app.use(`${apiPrefix}/users`, usersRouter);
app.use(`${apiPrefix}/auth`, authRouter);
app.use(`${apiPrefix}/comments`, commentsRouter);
app.use(`${apiPrefix}/security`, securityRouter);
app.use(`${apiPrefix}/testing`, testingRouter);

app.use(globalErrorMiddleware);