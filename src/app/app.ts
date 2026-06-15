import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from '../config/env';

import { blogsRouter } from '../modules/blogs/blogs.router';
import { postsRouter } from '../modules/posts/posts.router';

import { usersRouter } from '../modules/users/users.router';
import { authRouter } from '../modules/auth/auth.router';
import { commentsRouter } from '../modules/comments/comments.router';

import { testingRouter } from '../modules/testing/testing.router';

/**
 * app — Express-приложение.
 *
 * Здесь мы:
 * - подключаем middleware
 * - регистрируем роуты
 * - НЕ запускаем сервер
 *
 * Почему сервер запускается не здесь?
 * Потому что app нужен отдельно для тестов через supertest.
 */

export const app = express();

app.use( cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

/**
 * Health-check endpoint.
 *
 * Нужен для:
 * - проверки, что сервер жив
 * - Docker
 * - Vercel/Render/Railway
 * - тестов инфраструктуры
 */
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'API is running',
  });
});


app.use('/blogs', blogsRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/comments', commentsRouter);

app.use('/testing', testingRouter);