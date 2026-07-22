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
import { createUser, resetDb } from './helpers/test-helpers';

describe('Registration email resending API', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('POST /auth/registration-email-resending should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/auth/registration-email-resending')
      .send({ email: 'not-email' })
      .expect(400);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
    );
  });

  it('POST /auth/registration-email-resending should return 400 for missing email', async () => {
    await request(app)
      .post('/auth/registration-email-resending')
      .send({ email: 'missing@example.com' })
      .expect(400);
  });

  it('POST /auth/registration-email-resending should return 400 for already confirmed user', async () => {
    const { input } = await createUser({
      login: 'confirmed',
      email: 'confirmed@example.com',
    });

    await request(app)
      .post('/auth/registration-email-resending')
      .send({ email: input.email })
      .expect(400);
  });

  it('POST /auth/registration-email-resending should replace confirmation code for unconfirmed user', async () => {
    await request(app)
      .post('/auth/registration')
      .send({
        login: 'unconfirm',
        password: 'qwerty',
        email: 'unconfirm@example.com',
      })
      .expect(204);

    const userBefore = await UserModel.findOne({ email: 'unconfirm@example.com' }).lean();
    const oldCode = userBefore?.emailConfirmation.confirmationCode;

    await request(app)
      .post('/auth/registration-email-resending')
      .send({ email: 'unconfirm@example.com' })
      .expect(204);

    const userAfter = await UserModel.findOne({ email: 'unconfirm@example.com' }).lean();

    expect(userAfter?.emailConfirmation.confirmationCode).toEqual(expect.any(String));
    expect(userAfter?.emailConfirmation.confirmationCode).not.toBe(oldCode);
  });
});
