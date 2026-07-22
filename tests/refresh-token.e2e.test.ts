import request from 'supertest';
import { app } from '../src/app/app';
import { closeMongoConnection, connectToMongo } from '../src/db/mongo-client';
import { SecurityDeviceModel } from '../src/modules/auth/devices/security-device.model';
import { createUser, delay, getRefreshTokenCookie, resetDb } from './helpers/test-helpers';

describe('Refresh token edge cases', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('POST /auth/refresh-token should reject invalid cookie', async () => {
    await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', 'refreshToken=invalid-token')
      .expect(401);
  });

  it('POST /auth/refresh-token should rotate token and update device lastActiveDate', async () => {
    await createUser({ login: 'tokenuser', email: 'tokenuser@example.com' });

    const loginResponse = await request(app)
      .post('/auth/login')
      .set('User-Agent', 'Jest Device')
      .send({ loginOrEmail: 'tokenuser', password: 'qwerty' })
      .expect(200);

    const oldCookie = getRefreshTokenCookie(loginResponse.headers['set-cookie']);
    const deviceBefore = await SecurityDeviceModel.findOne({ title: 'Jest Device' }).lean();

    expect(deviceBefore).toBeTruthy();

    await delay(1100);

    const refreshResponse = await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', oldCookie)
      .expect(200);

    const newCookie = getRefreshTokenCookie(refreshResponse.headers['set-cookie']);
    const deviceAfter = await SecurityDeviceModel.findOne({ title: 'Jest Device' }).lean();

    expect(refreshResponse.body.accessToken).toEqual(expect.any(String));
    expect(newCookie).not.toBe(oldCookie);
    expect(deviceAfter?.lastActiveDate).not.toBe(deviceBefore?.lastActiveDate);

    await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', oldCookie)
      .expect(401);
  });

  it('POST /auth/logout should delete only current device session', async () => {
    await createUser({ login: 'session1', email: 'session1@example.com' });

    const firstLogin = await request(app)
      .post('/auth/login')
      .set('User-Agent', 'First Device')
      .send({ loginOrEmail: 'session1', password: 'qwerty' })
      .expect(200);

    const secondLogin = await request(app)
      .post('/auth/login')
      .set('User-Agent', 'Second Device')
      .send({ loginOrEmail: 'session1', password: 'qwerty' })
      .expect(200);

    const firstCookie = getRefreshTokenCookie(firstLogin.headers['set-cookie']);
    const secondCookie = getRefreshTokenCookie(secondLogin.headers['set-cookie']);

    await request(app).post('/auth/logout').set('Cookie', firstCookie).expect(204);

    await request(app).post('/auth/refresh-token').set('Cookie', firstCookie).expect(401);
    await request(app).post('/auth/refresh-token').set('Cookie', secondCookie).expect(200);
  });
});
