import request from 'supertest';
import { app } from '../src/app/app';
import {
  closeMongoConnection,
  connectToMongo,
} from '../src/db/mongo-client';

const adminAuth = {
  Authorization: `Basic ${Buffer.from('admin:qwerty').toString('base64')}`,
};

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createUser = async () => {
  const response = await request(app)
    .post('/users')
    .set(adminAuth)
    .send({
      login: 'user1',
      password: 'qwerty',
      email: 'user1@example.com',
    })
    .expect(201);

  return response.body;
};

const getRefreshTokenCookie = (cookies: string[] | undefined): string => {
  const refreshTokenCookie = cookies?.find((cookie) =>
    cookie.startsWith('refreshToken='),
  );

  expect(refreshTokenCookie).toBeDefined();

  return refreshTokenCookie as string;
};

describe('Auth API', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });

  beforeEach(async () => {
    await request(app).delete('/testing/all-data').expect(204);
  });

  it('POST /auth/login should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        loginOrEmail: '',
        password: '',
      })
      .expect(400);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'loginOrEmail' }),
        expect.objectContaining({ field: 'password' }),
      ]),
    );
  });

  it('POST /auth/login should return 401 for wrong credentials', async () => {
    await createUser();

    await request(app)
      .post('/auth/login')
      .send({
        loginOrEmail: 'user1',
        password: 'wrong-password',
      })
      .expect(401);
  });

  it('POST /auth/login should return accessToken and refreshToken cookie for correct login', async () => {
    await createUser();

    const response = await request(app)
      .post('/auth/login')
      .send({
        loginOrEmail: 'user1',
        password: 'qwerty',
      })
      .expect(200);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });

    const refreshTokenCookie = getRefreshTokenCookie(
      response.headers['set-cookie'],
    );

    expect(refreshTokenCookie).toContain('HttpOnly');
  });

  it('POST /auth/login should return accessToken for correct email', async () => {
    await createUser();

    const response = await request(app)
      .post('/auth/login')
      .send({
        loginOrEmail: 'user1@example.com',
        password: 'qwerty',
      })
      .expect(200);

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(getRefreshTokenCookie(response.headers['set-cookie'])).toContain(
      'refreshToken=',
    );
  });

  it('GET /auth/me should return 401 without token', async () => {
    await request(app).get('/auth/me').expect(401);
  });

  it('GET /auth/me should return 401 with invalid token', async () => {
    await request(app)
      .get('/auth/me')
      .set({
        Authorization: 'Bearer invalid-token',
      })
      .expect(401);
  });

  it('GET /auth/me should return current user by accessToken', async () => {
    const user = await createUser();

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        loginOrEmail: 'user1',
        password: 'qwerty',
      })
      .expect(200);

    const accessToken = loginResponse.body.accessToken;

    const meResponse = await request(app)
      .get('/auth/me')
      .set({
        Authorization: `Bearer ${accessToken}`,
      })
      .expect(200);

    expect(meResponse.body).toEqual({
      email: 'user1@example.com',
      login: 'user1',
      userId: user.id,
    });
  });

  it('POST /auth/refresh-token should return new accessToken and new refreshToken cookie', async () => {
    await createUser();

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        loginOrEmail: 'user1',
        password: 'qwerty',
      })
      .expect(200);

    const oldRefreshTokenCookie = getRefreshTokenCookie(
      loginResponse.headers['set-cookie'],
    );

    await delay(1100);

    const refreshResponse = await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', oldRefreshTokenCookie)
      .expect(200);

    expect(refreshResponse.body).toEqual({
      accessToken: expect.any(String),
    });

    const newRefreshTokenCookie = getRefreshTokenCookie(
      refreshResponse.headers['set-cookie'],
    );

    expect(newRefreshTokenCookie).toContain('refreshToken=');
    expect(newRefreshTokenCookie).not.toEqual(oldRefreshTokenCookie);

    await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', oldRefreshTokenCookie)
      .expect(401);
  });

  it('POST /auth/refresh-token should return 401 without refresh token cookie', async () => {
    await request(app).post('/auth/refresh-token').expect(401);
  });

  it('POST /auth/logout should invalidate refresh token', async () => {
    await createUser();

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        loginOrEmail: 'user1',
        password: 'qwerty',
      })
      .expect(200);

    const refreshTokenCookie = getRefreshTokenCookie(
      loginResponse.headers['set-cookie'],
    );

    await request(app)
      .post('/auth/logout')
      .set('Cookie', refreshTokenCookie)
      .expect(204);

    await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', refreshTokenCookie)
      .expect(401);
  });
});