import request from 'supertest';
import { app } from '../../src/app/app';
import { clearRateLimitAttempts } from '../../src/common/middlewares/rate-limit.middleware';

export const adminAuth = {
  Authorization: `Basic ${Buffer.from('admin:qwerty').toString('base64')}`,
};

export const resetDb = async (): Promise<void> => {
  clearRateLimitAttempts();
  await request(app).delete('/testing/all-data').expect(204);
};

export const createUser = async (
  overrides: Partial<{
    login: string;
    password: string;
    email: string;
  }> = {},
) => {
  const input = {
    login: overrides.login ?? `user${Date.now().toString().slice(-6)}`,
    password: overrides.password ?? 'qwerty',
    email: overrides.email ?? `user${Date.now()}@example.com`,
  };

  const response = await request(app)
    .post('/users')
    .set(adminAuth)
    .send(input)
    .expect(201);

  return {
    input,
    user: response.body,
  };
};

export const loginUser = async (
  loginOrEmail: string,
  password = 'qwerty',
) => {
  const response = await request(app)
    .post('/auth/login')
    .send({ loginOrEmail, password })
    .expect(200);

  const refreshTokenCookie = getRefreshTokenCookie(response.headers['set-cookie']);

  return {
    accessToken: response.body.accessToken as string,
    refreshTokenCookie,
  };
};

export const createBlog = async (
  overrides: Partial<{
    name: string;
    description: string;
    websiteUrl: string;
  }> = {},
) => {
  const response = await request(app)
    .post('/blogs')
    .set(adminAuth)
    .send({
      name: overrides.name ?? 'Blog Name',
      description: overrides.description ?? 'Blog description',
      websiteUrl: overrides.websiteUrl ?? 'https://example.com',
    })
    .expect(201);

  return response.body;
};

export const createPost = async (
  blogId: string,
  overrides: Partial<{
    title: string;
    shortDescription: string;
    content: string;
  }> = {},
) => {
  const response = await request(app)
    .post('/posts')
    .set(adminAuth)
    .send({
      title: overrides.title ?? 'Post title',
      shortDescription: overrides.shortDescription ?? 'Post short description',
      content: overrides.content ?? 'Post content',
      blogId,
    })
    .expect(201);

  return response.body;
};

export const createComment = async (
  postId: string,
  accessToken: string,
  content = 'This is a valid comment content for testing.',
) => {
  const response = await request(app)
    .post(`/posts/${postId}/comments`)
    .set({ Authorization: `Bearer ${accessToken}` })
    .send({ content })
    .expect(201);

  return response.body;
};

export const getRefreshTokenCookie = (cookies: string[] | undefined): string => {
  const refreshTokenCookie = cookies?.find((cookie) =>
    cookie.startsWith('refreshToken='),
  );

  expect(refreshTokenCookie).toBeDefined();

  return refreshTokenCookie as string;
};

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
