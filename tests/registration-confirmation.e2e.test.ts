jest.mock('../src/modules/auth/email/email.manager', () => ({
  emailManager: {
    sendEmail: jest.fn().mockResolvedValue(true),
    sendRegistrationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordRecoveryEmail: jest.fn().mockResolvedValue(true),
  },
}));

import request from 'supertest';
import { app } from '../src/app/app';
import { closeMongoConnection, connectToMongo } from '../src/db/mongo-client';
import { UserModel } from '../src/modules/users/domain/user.model';
import { resetDb } from './helpers/test-helpers';

describe('Registration confirmation API', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('POST /auth/registration should create unconfirmed user', async () => {
    await request(app)
      .post('/auth/registration')
      .send({
        login: 'reguser',
        password: 'qwerty',
        email: 'reguser@example.com',
      })
      .expect(204);

    const user = await UserModel.findOne({ login: 'reguser' }).lean();

    expect(user).toBeTruthy();
    expect(user?.emailConfirmation.isConfirmed).toBe(false);
    expect(user?.emailConfirmation.confirmationCode).toEqual(expect.any(String));
  });

  it('POST /auth/registration should return 400 for duplicate login or email', async () => {
    await request(app)
      .post('/auth/registration')
      .send({
        login: 'reguser',
        password: 'qwerty',
        email: 'reguser@example.com',
      })
      .expect(204);

    await request(app)
      .post('/auth/registration')
      .send({
        login: 'reguser',
        password: 'qwerty',
        email: 'another@example.com',
      })
      .expect(400);

    await request(app)
      .post('/auth/registration')
      .send({
        login: 'another',
        password: 'qwerty',
        email: 'reguser@example.com',
      })
      .expect(400);
  });

  it('POST /auth/registration-confirmation should return 400 for invalid code', async () => {
    await request(app)
      .post('/auth/registration-confirmation')
      .send({ code: 'wrong-code' })
      .expect(400);
  });

  it('POST /auth/registration-confirmation should confirm user and allow login', async () => {
    await request(app)
      .post('/auth/registration')
      .send({
        login: 'reguser',
        password: 'qwerty',
        email: 'reguser@example.com',
      })
      .expect(204);

    await request(app)
      .post('/auth/login')
      .send({ loginOrEmail: 'reguser', password: 'qwerty' })
      .expect(401);

    const userBefore = await UserModel.findOne({ login: 'reguser' }).lean();
    const confirmationCode = userBefore?.emailConfirmation.confirmationCode;

    await request(app)
      .post('/auth/registration-confirmation')
      .send({ code: confirmationCode })
      .expect(204);

    const userAfter = await UserModel.findOne({ login: 'reguser' }).lean();

    expect(userAfter?.emailConfirmation.isConfirmed).toBe(true);

    await request(app)
      .post('/auth/login')
      .send({ loginOrEmail: 'reguser', password: 'qwerty' })
      .expect(200);

    await request(app)
      .post('/auth/registration-confirmation')
      .send({ code: confirmationCode })
      .expect(400);
  });
});
