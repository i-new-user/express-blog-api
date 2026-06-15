import { Request, Response, NextFunction } from 'express';

/**
 * Basic Auth middleware.
 *
 * По учебной спецификации protected admin endpoints должны быть закрыты
 * через Basic Authorization.
 *
 * Клиент должен отправить header:
 *
 * Authorization: Basic base64(admin:qwerty)
 *
 * Важно:
 * Basic Auth — это не полноценная пользовательская авторизация.
 * Для пользователей позже будет JWT.
 */
export const basicAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.sendStatus(401);
    return;
  }

  const [authType, encodedCredentials] = authHeader.split(' ');

  if (authType !== 'Basic' || !encodedCredentials) {
    res.sendStatus(401);
    return;
  }

  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString(
    'utf-8',
  );

  const [login, password] = decodedCredentials.split(':');

  if (login !== 'admin' || password !== 'qwerty') {
    res.sendStatus(401);
    return;
  }

  next();
};