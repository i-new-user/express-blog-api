# H14: Auth, guards и validation в NestJS

## 1. Что добавилось после H13

H13 показал базовую цепочку:

```text
Controller -> Service -> Repository -> Mongoose -> MongoDB
```

H14 добавляет действия, которые выполняются до controller:

```text
HTTP request
  -> Guard (проверка Basic/Bearer Auth)
  -> Pipe (валидация и преобразование body)
  -> Controller
  -> Service
  -> Repository
  -> MongoDB
```

Глобальный префикс изменён в `configure-app.ts`:

```ts
export const API_PREFIX = 'hometask_14/api';
```

Одна функция `configureApp()` вызывается и в `main.ts`, и в e2e-тестах. Поэтому
production и test application получают одинаковые настройки.

## 2. AuthModule и границы модулей

`AuthModule` импортирует `UsersModule`:

```ts
@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtTokenService,
    BearerAuthGuard,
    EmailService,
  ],
})
export class AuthModule {}
```

Auth не хранит отдельного пользователя. Он использует ту же коллекцию `users`
через экспортированные `UsersService` и `UsersRepository`.

Зависимости `AuthService`:

```text
AuthService
  -> UsersService: создание пользователя при регистрации
  -> UsersRepository: поиск и изменение пользователя
  -> JwtTokenService: создание access token
  -> EmailService: отправка confirmation/recovery email
```

## 3. Basic Auth для CRUD users

`@UseGuards(BasicAuthGuard)` установлен на весь `UsersController`. Поэтому
guard выполняется перед каждым методом controller:

```ts
@Controller('users')
@UseGuards(BasicAuthGuard)
export class UsersController {}
```

Клиент передаёт:

```text
Authorization: Basic YWRtaW46cXdlcnR5
```

Строка после `Basic` — Base64 от `login:password`. Base64 не является
шифрованием; это только кодирование. Поэтому Basic Auth должен использоваться
через HTTPS. Vercel предоставляет HTTPS.

Guard:

1. получает `Authorization`;
2. проверяет тип `Basic`;
3. декодирует Base64;
4. отделяет login от password по `:`;
5. сравнивает значения с `ADMIN_LOGIN` и `ADMIN_PASSWORD`;
6. возвращает `true` или выбрасывает `UnauthorizedException`.

Guard ничего не возвращает клиенту самостоятельно. Исключение обрабатывает
Nest exception layer, который выставляет статус 401.

## 4. ZodValidationPipe

TypeScript-типы исчезают после компиляции и не могут проверить JSON от клиента.
Поэтому DTO и runtime validation решают разные задачи:

```ts
export class CreateUserDto {
  login!: string;
  password!: string;
  email!: string;
}
```

DTO помогает TypeScript, а Zod schema проверяет реальные данные:

```ts
export const createUserSchema = z.object({
  login: z.string().min(3).max(10).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(6).max(20),
  email: z.string().trim().toLowerCase().email(),
});
```

Pipe подключается к `@Body()`:

```ts
@Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto
```

Если данные корректны, controller получает `result.data`. Это важно: email уже
будет приведён к нижнему регистру. Если данные ошибочны, pipe выбрасывает:

```json
{
  "errorsMessages": [
    {
      "message": "Email has invalid format",
      "field": "email"
    }
  ]
}
```

## 5. Создание администрацией и регистрация — разные сценарии

`POST /users` создаёт уже подтверждённого пользователя:

```text
Basic Auth -> validation -> UsersService.create()
                              -> isConfirmed: true
```

`POST /auth/registration` создаёт неподтверждённого пользователя:

```text
validation -> AuthService.register()
              -> UsersService.createForRegistration()
              -> isConfirmed: false
              -> EmailService.sendRegistrationEmail()
```

Общий приватный метод `UsersService.createUser()` не дублирует хеширование
пароля, обработку Mongo duplicate key и создание confirmation-данных.

## 6. Хеширование пароля

Пароль никогда не сохраняется в MongoDB как обычная строка:

```ts
const passwordHash = await bcrypt.hash(password, saltRounds);
```

При login пароль не расшифровывается:

```ts
const isPasswordCorrect = await bcrypt.compare(password, passwordHash);
```

`bcrypt.compare()` хеширует введённый пароль с параметрами, записанными внутри
существующего hash, и сравнивает результат.

## 7. Login и JWT

Login выполняет:

1. поиск по login или email;
2. проверку, что email подтверждён;
3. `bcrypt.compare()`;
4. создание JWT.

Payload токена:

```json
{
  "userId": "mongodb-object-id",
  "iat": 178...",
  "exp": 178...
}
```

JWT подписывается `ACCESS_TOKEN_SECRET`. Payload можно прочитать без секрета,
поэтому в него нельзя класть пароль или другие секретные данные. Подпись нужна,
чтобы пользователь не смог незаметно изменить `userId` или срок действия.

Срок жизни access token зафиксирован на 5 минут, как требует задание.

## 8. Bearer Auth и `/auth/me`

Клиент передаёт:

```text
Authorization: Bearer <jwt>
```

`BearerAuthGuard`:

1. получает token;
2. проверяет подпись и expiration;
3. извлекает `userId`;
4. записывает его в request;
5. разрешает controller продолжить работу.

`AuthController.me()` получает `request.userId`, а `AuthService` загружает
актуального пользователя из MongoDB. Если пользователя удалили после выдачи
токена, endpoint вернёт 401.

## 9. Confirmation code

При регистрации создаются:

```ts
{
  confirmationCode: uuidv4(),
  expirationDate: now + 1 hour,
  isConfirmed: false
}
```

Подтверждение допустимо только когда:

- пользователь с таким code найден;
- `isConfirmed === false`;
- code не истёк.

Повторная отправка создаёт новый UUID и новый срок. Старый code перестаёт
работать, потому что заменяется в документе пользователя.

## 10. Password recovery

`POST /auth/password-recovery` всегда возвращает 204 — даже для неизвестного
email. Иначе злоумышленник мог бы перебирать адреса и узнавать, кто
зарегистрирован.

Для существующего пользователя:

1. создаётся recovery code;
2. устанавливается expiration;
3. код сохраняется в MongoDB;
4. ссылка отправляется через EmailService.

`POST /auth/new-password` проверяет code и expiration, хеширует новый пароль,
а затем очищает recovery code. Поэтому успешно использованный code нельзя
применить повторно.

## 11. Почему EmailService — provider

Контроллер и AuthService не импортируют готовый глобальный объект emailManager.
Nest внедряет экземпляр:

```ts
constructor(private readonly emailService: EmailService) {}
```

В e2e-тесте настоящий provider заменяется:

```ts
Test.createTestingModule({ imports: [AppModule] })
  .overrideProvider(EmailService)
  .useValue(emailServiceMock)
  .compile();
```

Преимущества:

- тесты не отправляют письма;
- можно получить confirmation/recovery code из аргументов mock;
- тесты быстрые и не зависят от Gmail;
- production-код не содержит `if (NODE_ENV === 'test')`.

Это практический пример Dependency Injection: `AuthService` зависит от
контракта методов EmailService, а конкретный объект выбирает IoC container.

## 12. Почему нет rate limit и refresh token

У H14 есть ответы 429 в общей Swagger-документации, но в тексте задания прямо
указано отключить IP restriction. Поэтому rate-limit middleware/guard не
подключён.

Refresh token flow также разрешено не переносить. Login возвращает только:

```json
{
  "accessToken": "..."
}
```

Cookie parser для этой реализации не нужен, потому что refresh token cookie не
создаётся и не читается.

## 13. Проверка

```bash
yarn build
yarn typecheck:h14
yarn test:h14
```

Полный e2e-тест требует MongoDB из `.env.test`. Перед тестами приложение
создаётся через `@nestjs/testing`, вызывает ту же `configureApp()`, заменяет
EmailService mock-объектом и очищает базу через `/testing/all-data`.
