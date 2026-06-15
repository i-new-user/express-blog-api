import request from 'supertest';
import { app } from '../src/app/app';
import { closeMongoConnection, connectToMongo } from '../src/db/mongo-client';

const adminAuth = {
  Authorization: `Basic ${Buffer.from('admin:qwerty').toString('base64')}`,
};

describe('Users API', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });

  beforeEach(async () => {
    await request(app).delete('/testing/all-data').expect(204);
  });

  it('GET /users should return 401 without Basic Auth', async () => {
    await request(app).get('/users').expect(401);
  });

  it('GET /users should return empty pagination result', async () => {
    const response = await request(app)
      .get('/users')
      .set(adminAuth)
      .expect(200);

    expect(response.body).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('POST /users should return 401 without Basic Auth', async () => {
    await request(app)
      .post('/users')
      .send({
        login: 'user1',
        password: 'qwerty',
        email: 'user1@example.com',
      })
      .expect(401);
  });

  it('POST /users should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/users')
      .set(adminAuth)
      .send({
        login: 'u',
        password: '123',
        email: 'invalid-email',
      })
      .expect(400);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'login' }),
        expect.objectContaining({ field: 'password' }),
        expect.objectContaining({ field: 'email' }),
      ]),
    );
  });

  it('POST /users should create user with valid input', async () => {
    const response = await request(app)
      .post('/users')
      .set(adminAuth)
      .send({
        login: 'user1',
        password: 'qwerty',
        email: 'user1@example.com',
      })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      login: 'user1',
      email: 'user1@example.com',
      createdAt: expect.any(String),
    });

    expect(response.body.password).toBeUndefined();
    expect(response.body.passwordHash).toBeUndefined();
  });

  it('POST /users should return 400 if login already exists', async () => {
    await request(app)
      .post('/users')
      .set(adminAuth)
      .send({
        login: 'user1',
        password: 'qwerty',
        email: 'user1@example.com',
      })
      .expect(201);

    await request(app)
      .post('/users')
      .set(adminAuth)
      .send({
        login: 'user1',
        password: 'qwerty',
        email: 'another@example.com',
      })
      .expect(400);
  });

  it('POST /users should return 400 if email already exists', async () => {
    await request(app)
      .post('/users')
      .set(adminAuth)
      .send({
        login: 'user1',
        password: 'qwerty',
        email: 'user1@example.com',
      })
      .expect(201);

    await request(app)
      .post('/users')
      .set(adminAuth)
      .send({
        login: 'user2',
        password: 'qwerty',
        email: 'user1@example.com',
      })
      .expect(400);
  });

  it('GET /users should return created users with pagination', async () => {
    await request(app)
      .post('/users')
      .set(adminAuth)
      .send({
        login: 'user1',
        password: 'qwerty',
        email: 'user1@example.com',
      })
      .expect(201);

    await request(app)
      .post('/users')
      .set(adminAuth)
      .send({
        login: 'user2',
        password: 'qwerty',
        email: 'user2@example.com',
      })
      .expect(201);

    const response = await request(app)
      .get('/users?pageNumber=1&pageSize=10')
      .set(adminAuth)
      .expect(200);

    expect(response.body.totalCount).toBe(2);
    expect(response.body.items).toHaveLength(2);
  });

  it('DELETE /users/:id should delete user', async () => {
    const createResponse = await request(app)
      .post('/users')
      .set(adminAuth)
      .send({
        login: 'user1',
        password: 'qwerty',
        email: 'user1@example.com',
      })
      .expect(201);

    const userId = createResponse.body.id;

    await request(app)
      .delete(`/users/${userId}`)
      .set(adminAuth)
      .expect(204);

    const usersResponse = await request(app)
      .get('/users')
      .set(adminAuth)
      .expect(200);

    expect(usersResponse.body.totalCount).toBe(0);
    expect(usersResponse.body.items).toEqual([]);
  });
});