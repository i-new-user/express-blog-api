import request from 'supertest';
import { app } from '../src/app/app';
import {
  closeMongoConnection,
  connectToMongo,
} from '../src/db/mongo-client';

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

const loginUser = async (userAgent: string) => {
  const response = await request(app)
    .post('/auth/login')
    .set('User-Agent', userAgent)
    .send({
      loginOrEmail: 'user1',
      password: 'qwerty',
    })
    .expect(200);

  const refreshTokenCookie = response.headers['set-cookie']?.find(
    (cookie: string) => cookie.startsWith('refreshToken='),
  );

  expect(refreshTokenCookie).toBeDefined();

  return refreshTokenCookie as string;
};

describe('Security Devices API', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });

  beforeEach(async () => {
    await request(app).delete('/testing/all-data').expect(204);
  });

  it('GET /security/devices should return 401 without refresh token cookie', async () => {
    await request(app).get('/security/devices').expect(401);
  });

  it('GET /security/devices should return all active devices for current user', async () => {
    await createUser();

    const cookie1 = await loginUser('Chrome Test Device');
    await loginUser('Firefox Test Device');

    const response = await request(app)
      .get('/security/devices')
      .set('Cookie', cookie1)
      .expect(200);

    expect(response.body).toHaveLength(2);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ip: expect.any(String),
          title: 'Chrome Test Device',
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        }),
        expect.objectContaining({
          ip: expect.any(String),
          title: 'Firefox Test Device',
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        }),
      ]),
    );
  });

  it('DELETE /security/devices should delete all other devices except current', async () => {
    await createUser();

    const cookie1 = await loginUser('Chrome Test Device');
    const cookie2 = await loginUser('Firefox Test Device');

    await request(app)
      .delete('/security/devices')
      .set('Cookie', cookie1)
      .expect(204);

    const response = await request(app)
      .get('/security/devices')
      .set('Cookie', cookie1)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Chrome Test Device');

    await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', cookie2)
      .expect(401);
  });

  it('DELETE /security/devices/:deviceId should delete selected device', async () => {
    await createUser();

    const cookie1 = await loginUser('Chrome Test Device');
    const cookie2 = await loginUser('Firefox Test Device');

    const devicesResponse = await request(app)
      .get('/security/devices')
      .set('Cookie', cookie1)
      .expect(200);

    const firefoxDevice = devicesResponse.body.find(
      (device: { title: string }) => device.title === 'Firefox Test Device',
    );

    expect(firefoxDevice).toBeDefined();

    await request(app)
      .delete(`/security/devices/${firefoxDevice.deviceId}`)
      .set('Cookie', cookie1)
      .expect(204);

    await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', cookie2)
      .expect(401);

    const afterDeleteResponse = await request(app)
      .get('/security/devices')
      .set('Cookie', cookie1)
      .expect(200);

    expect(afterDeleteResponse.body).toHaveLength(1);
    expect(afterDeleteResponse.body[0].title).toBe('Chrome Test Device');
  });

  it('DELETE /security/devices/:deviceId should return 404 if device does not exist', async () => {
    await createUser();

    const cookie = await loginUser('Chrome Test Device');

    await request(app)
      .delete('/security/devices/non-existing-device-id')
      .set('Cookie', cookie)
      .expect(404);
  });

  it('DELETE /security/devices/:deviceId should return 403 if device belongs to another user', async () => {
    await createUser();

    const user1Cookie = await loginUser('User 1 Device');

    const user1DevicesResponse = await request(app)
      .get('/security/devices')
      .set('Cookie', user1Cookie)
      .expect(200);

    const user1DeviceId = user1DevicesResponse.body[0].deviceId;

    await request(app).delete('/testing/all-data').expect(204);

    await request(app)
      .post('/users')
      .set(adminAuth)
      .send({
        login: 'user2',
        password: 'qwerty',
        email: 'user2@example.com',
      })
      .expect(201);

    const user2LoginResponse = await request(app)
      .post('/auth/login')
      .set('User-Agent', 'User 2 Device')
      .send({
        loginOrEmail: 'user2',
        password: 'qwerty',
      })
      .expect(200);

    const user2Cookie = user2LoginResponse.headers['set-cookie']?.find(
      (cookie: string) => cookie.startsWith('refreshToken='),
    );

    expect(user2Cookie).toBeDefined();

    await request(app)
      .delete(`/security/devices/${user1DeviceId}`)
      .set('Cookie', user2Cookie as string)
      .expect(404);
  });
});