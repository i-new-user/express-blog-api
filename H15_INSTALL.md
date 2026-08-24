# H15: установка готовых файлов

Архив содержит полный проект. Проще всего распаковать его поверх копии
репозитория с подтверждением замены файлов, затем выполнить:

```powershell
yarn install --frozen-lockfile
yarn build
yarn typecheck:h15
yarn test:h15
```

Если переносить файлы вручную, сначала создайте новые каталоги:

```powershell
New-Item -ItemType Directory -Force src/nest/features/auth/use-cases
New-Item -ItemType Directory -Force src/nest/features/blogs/use-cases
New-Item -ItemType Directory -Force src/nest/features/comments/dto
New-Item -ItemType Directory -Force src/nest/features/comments/use-cases
New-Item -ItemType Directory -Force src/nest/features/posts/use-cases
```

Новые файлы:

- `src/nest/features/auth/optional-bearer-auth.guard.ts`
- `src/nest/features/auth/use-cases/auth.use-cases.ts`
- `src/nest/features/auth/use-cases/login.use-case.ts`
- `src/nest/features/blogs/use-cases/blogs.use-cases.ts`
- `src/nest/features/comments/comments.repository.ts`
- `src/nest/features/comments/dto/comment.dto.ts`
- `src/nest/features/comments/use-cases/comments.use-cases.ts`
- `src/nest/features/posts/use-cases/posts.use-cases.ts`

Все остальные файлы из архива заменяют одноимённые файлы проекта.

API H15 доступно по префиксу `/hometask_15/api`.
