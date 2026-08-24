import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/nest/app.module';
import { appConfig } from '../src/nest/config/app.config';
import { API_PREFIX, configureApp } from '../src/nest/configure-app';
import { EmailService } from '../src/nest/features/auth/email.service';

const api = `/${API_PREFIX}`;
const basicAuth = `Basic ${Buffer.from(
  `${appConfig.adminLogin}:${appConfig.adminPassword}`,
).toString('base64')}`;

describe('Hometask 15 NestJS API', () => {
  let app: INestApplication;

  const emailServiceMock = {
    sendRegistrationEmail: jest.fn(
      async (_email: string, _confirmationCode: string) => true,
    ),
    sendPasswordRecoveryEmail: jest.fn(
      async (_email: string, _recoveryCode: string) => true,
    ),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(emailServiceMock)
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  }, 15_000);

  beforeEach(async () => {
    jest.clearAllMocks();
    await request(app.getHttpServer())
      .delete(`${api}/testing/all-data`)
      .expect(204);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('users with Basic Auth', () => {
    it('rejects requests without valid Basic credentials', async () => {
      await request(app.getHttpServer()).get(`${api}/users`).expect(401);
      await request(app.getHttpServer())
        .post(`${api}/users`)
        .set('Authorization', 'Basic incorrect')
        .send({
          login: 'alice',
          password: 'qwerty123',
          email: 'alice@example.dev',
        })
        .expect(401);
    });

    it('validates, creates, lists and deletes a user', async () => {
      const validationError = await request(app.getHttpServer())
        .post(`${api}/users`)
        .set('Authorization', basicAuth)
        .send({ login: 'a', password: '1', email: 'wrong-email' })
        .expect(400);

      expect(validationError.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'login' }),
          expect.objectContaining({ field: 'password' }),
          expect.objectContaining({ field: 'email' }),
        ]),
      );

      const created = await createAdminUser(
        'alice',
        'alice@example.dev',
        'qwerty123',
      );

      expect(created).toEqual({
        id: expect.any(String),
        login: 'alice',
        email: 'alice@example.dev',
        createdAt: expect.any(String),
      });

      const page = await request(app.getHttpServer())
        .get(`${api}/users?searchLoginTerm=ALI`)
        .set('Authorization', basicAuth)
        .expect(200);
      expect(page.body.totalCount).toBe(1);

      await request(app.getHttpServer())
        .delete(`${api}/users/${created.id}`)
        .set('Authorization', basicAuth)
        .expect(204);
      await request(app.getHttpServer())
        .delete(`${api}/users/${created.id}`)
        .set('Authorization', basicAuth)
        .expect(404);
    });
  });

  describe('login and current user', () => {
    it('returns an access token and resolves /auth/me', async () => {
      await createAdminUser('bob', 'bob@example.dev', 'secret12');

      await request(app.getHttpServer())
        .post(`${api}/auth/login`)
        .send({ loginOrEmail: 'bob', password: 'wrong-password' })
        .expect(401);

      const login = await request(app.getHttpServer())
        .post(`${api}/auth/login`)
        .send({ loginOrEmail: 'bob@example.dev', password: 'secret12' })
        .expect(200);

      expect(login.body.accessToken).toEqual(expect.any(String));
      expect(String(login.headers['set-cookie'])).toContain('refreshToken=');

      await request(app.getHttpServer())
        .get(`${api}/auth/me`)
        .expect(401);

      const meResponse = await request(app.getHttpServer())
        .get(`${api}/auth/me`)
        .set('Authorization', `Bearer ${login.body.accessToken}`)
        .expect(200);

      expect(meResponse.body).toEqual({
          email: 'bob@example.dev',
          login: 'bob',
          userId: expect.any(String),
      });
    });
  });

  describe('registration and confirmation', () => {
    it('registers an unconfirmed user and confirms the emailed code', async () => {
      await request(app.getHttpServer())
        .post(`${api}/auth/registration`)
        .send({
          login: 'carol',
          password: 'secret12',
          email: 'carol@example.dev',
        })
        .expect(204);

      expect(emailServiceMock.sendRegistrationEmail).toHaveBeenCalledTimes(1);
      const confirmationCode =
        emailServiceMock.sendRegistrationEmail.mock.calls[0][1];

      await request(app.getHttpServer())
        .post(`${api}/auth/login`)
        .send({ loginOrEmail: 'carol', password: 'secret12' })
        .expect(401);

      await request(app.getHttpServer())
        .post(`${api}/auth/registration-confirmation`)
        .send({ code: confirmationCode })
        .expect(204);

      await request(app.getHttpServer())
        .post(`${api}/auth/registration-confirmation`)
        .send({ code: confirmationCode })
        .expect(400);

      await request(app.getHttpServer())
        .post(`${api}/auth/login`)
        .send({ loginOrEmail: 'carol', password: 'secret12' })
        .expect(200);
    });

    it('resends a new code only for an unconfirmed user', async () => {
      await request(app.getHttpServer())
        .post(`${api}/auth/registration`)
        .send({
          login: 'dave',
          password: 'secret12',
          email: 'dave@example.dev',
        })
        .expect(204);

      const oldCode = emailServiceMock.sendRegistrationEmail.mock.calls[0][1];

      await request(app.getHttpServer())
        .post(`${api}/auth/registration-email-resending`)
        .send({ email: 'dave@example.dev' })
        .expect(204);

      expect(emailServiceMock.sendRegistrationEmail).toHaveBeenCalledTimes(2);
      const newCode = emailServiceMock.sendRegistrationEmail.mock.calls[1][1];
      expect(newCode).not.toBe(oldCode);

      await request(app.getHttpServer())
        .post(`${api}/auth/registration-confirmation`)
        .send({ code: oldCode })
        .expect(400);

      await request(app.getHttpServer())
        .post(`${api}/auth/registration-confirmation`)
        .send({ code: newCode })
        .expect(204);

      await request(app.getHttpServer())
        .post(`${api}/auth/registration-email-resending`)
        .send({ email: 'dave@example.dev' })
        .expect(400);
    });
  });

  describe('password recovery', () => {
    it('changes the password using the emailed recovery code', async () => {
      await createAdminUser('erin', 'erin@example.dev', 'oldpass1');

      await request(app.getHttpServer())
        .post(`${api}/auth/password-recovery`)
        .send({ email: 'unknown@example.dev' })
        .expect(204);
      expect(emailServiceMock.sendPasswordRecoveryEmail).not.toHaveBeenCalled();

      await request(app.getHttpServer())
        .post(`${api}/auth/password-recovery`)
        .send({ email: 'erin@example.dev' })
        .expect(204);

      const recoveryCode =
        emailServiceMock.sendPasswordRecoveryEmail.mock.calls[0][1];

      await request(app.getHttpServer())
        .post(`${api}/auth/new-password`)
        .send({ newPassword: 'newpass1', recoveryCode: 'wrong-code' })
        .expect(400);

      await request(app.getHttpServer())
        .post(`${api}/auth/new-password`)
        .send({ newPassword: 'newpass1', recoveryCode })
        .expect(204);

      await request(app.getHttpServer())
        .post(`${api}/auth/login`)
        .send({ loginOrEmail: 'erin', password: 'oldpass1' })
        .expect(401);

      await request(app.getHttpServer())
        .post(`${api}/auth/login`)
        .send({ loginOrEmail: 'erin', password: 'newpass1' })
        .expect(200);
    });
  });

  async function createAdminUser(
    login: string,
    email: string,
    password: string,
  ) {
    const response = await request(app.getHttpServer())
      .post(`${api}/users`)
      .set('Authorization', basicAuth)
      .send({ login, email, password })
      .expect(201);

    return response.body as {
      id: string;
      login: string;
      email: string;
      createdAt: string;
    };
  }
});
