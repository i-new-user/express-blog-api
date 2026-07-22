# Backend API — hometask 13

Учебный REST API, перенесённый с Express на NestJS.

Активное приложение реализует:

- CRUD users без авторизации;
- CRUD blogs без авторизации;
- CRUD posts без авторизации;
- создание и получение постов конкретного блога;
- чтение комментария и списка комментариев поста;
- чтение сохранённых likes/dislikes;
- очистку тестовой базы.

Согласно заданию h13 не подключены auth, devices, Basic/Bearer Auth, валидация,
изменение комментариев и изменение лайков.

## Запуск

```bash
cp .env.example .env
yarn install
yarn dev
```

Базовый URL:

```text
http://localhost:3000/hometask_13/api
```

Проверка:

```bash
yarn build
yarn test:h13
```

Для e2e-теста MongoDB должна быть доступна по адресу из `.env.test`.

## Активная структура

```text
src/
  main.ts
  nest/
    app.module.ts
    configure-app.ts
    config/
    common/
    features/
      users/
      blogs/
      posts/
      comments/
      testing/
```

Старый Express-код пока сохранён в `src/app`, `src/modules`, `src/common` и
`src/db` как материал для сравнения. Он не импортируется в `AppModule` и не
публикует маршруты в запущенном Nest-приложении.

Подробное объяснение миграции: [NEST_MIGRATION_GUIDE.md](./NEST_MIGRATION_GUIDE.md).
