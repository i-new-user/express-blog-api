# Backend API — hometask 14

Учебный REST API на NestJS и Mongoose. H14 продолжает миграцию Express-кода,
начатую в H13.

Активное приложение реализует:

- auth: login, JWT access token и `GET /auth/me`;
- регистрацию, подтверждение и повторную отправку confirmation email;
- восстановление и изменение пароля;
- CRUD users под Basic Auth;
- CRUD blogs и posts без авторизации;
- чтение comments и likes, перенесённое в H13;
- очистку тестовой базы.

Refresh token flow в H14 не подключён, что разрешено заданием. Rate limit/IP
restriction также не подключён.

## Запуск

```bash
cp .env.example .env
yarn install
yarn dev
```

Базовый URL:

```text
http://localhost:3000/hometask_14/api
```

Проверка:

```bash
yarn build
yarn typecheck:h14
yarn test:h14
```

Для e2e-теста MongoDB должна быть доступна по адресу из `.env.test`.
`EmailService` в тестах заменяется mock-объектом через `overrideProvider`, поэтому
тесты не отправляют настоящие письма.

## Авторизация

Users endpoints используют Basic Auth:

```text
Authorization: Basic base64(ADMIN_LOGIN:ADMIN_PASSWORD)
```

`GET /auth/me` использует JWT:

```text
Authorization: Bearer <accessToken>
```

Access token живёт 5 минут.

## Активная структура

```text
src/
  main.ts
  nest/
    app.module.ts
    configure-app.ts
    config/
    common/
      guards/
      pipes/
    features/
      auth/
      users/
      blogs/
      posts/
      comments/
      testing/
```

Старый Express-код сохранён в `src/app`, `src/modules`, `src/common` и `src/db`
для сравнения. Активные Nest-модули расположены в `src/nest`.

Подробные объяснения:

- [NEST_MIGRATION_GUIDE.md](./NEST_MIGRATION_GUIDE.md) — основы H13;
- [H14_AUTH_GUIDE.md](./H14_AUTH_GUIDE.md) — auth, guards, validation и mock
  providers в H14.
