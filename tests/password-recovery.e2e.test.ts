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

describe('Password recovery API', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('POST /auth/password-recovery should return 400 for invalid email', async () => {
    const response = await request(app)
      .post('/auth/password-recovery')
      .send({ email: 'invalid-email' })
      .expect(400);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
    );
  });

  it('POST /auth/password-recovery should return 204 even if email does not exist', async () => {
    await request(app)
      .post('/auth/password-recovery')
      .send({ email: 'missing@example.com' })
      .expect(204);
  });

  it('POST /auth/password-recovery should save recovery code for existing user', async () => {
    const { input } = await createUser({
      login: 'recover1',
      email: 'recover1@example.com',
    });

    await request(app)
      .post('/auth/password-recovery')
      .send({ email: input.email })
      .expect(204);

    const user = await UserModel.findOne({ email: input.email }).lean();

    expect(user?.emailConfirmation.recoveryCode).toEqual(expect.any(String));
    expect(user?.emailConfirmation.recoveryCodeExpirationDate).toBeInstanceOf(Date);
  });

  it('POST /auth/new-password should return 400 for invalid recovery code', async () => {
    await request(app)
      .post('/auth/new-password')
      .send({
        newPassword: 'newpass1',
        recoveryCode: 'wrong-code',
      })
      .expect(400);
  });

  it('POST /auth/new-password should change password and invalidate recovery code', async () => {
    const { input } = await createUser({
      login: 'recover2',
      password: 'oldpass',
      email: 'recover2@example.com',
    });

    await request(app)
      .post('/auth/password-recovery')
      .send({ email: input.email })
      .expect(204);

    const userBefore = await UserModel.findOne({ email: input.email }).lean();
    const recoveryCode = userBefore?.emailConfirmation.recoveryCode;

    expect(recoveryCode).toEqual(expect.any(String));

    await request(app)
      .post('/auth/new-password')
      .send({
        newPassword: 'newpass1',
        recoveryCode,
      })
      .expect(204);

    await request(app)
      .post('/auth/login')
      .send({ loginOrEmail: input.login, password: 'oldpass' })
      .expect(401);

    await request(app)
      .post('/auth/login')
      .send({ loginOrEmail: input.login, password: 'newpass1' })
      .expect(200);

    const userAfter = await UserModel.findOne({ email: input.email }).lean();

    expect(userAfter?.emailConfirmation.recoveryCode).toBeNull();
    expect(userAfter?.emailConfirmation.recoveryCodeExpirationDate).toBeNull();
  });
});
