import request from 'supertest';
import { app } from '../src/app/app';
import { closeMongoConnection, connectToMongo } from '../src/db/mongo-client';

const adminAuth = {
  Authorization: `Basic ${Buffer.from('admin:qwerty').toString('base64')}`,
};

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

  it('POST /auth/login should return accessToken for correct login', async () => {
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
});