# Переход Express → NestJS: подробный разбор h13

> Это руководство описывает этап H13. Продолжение с auth, guards и validation:
> [H14_AUTH_GUIDE.md](./H14_AUTH_GUIDE.md).

## 1. Что именно изменилось

Express и Nest решают одну задачу: принимают HTTP-запрос и возвращают ответ.
Разница в том, кто отвечает за организацию объектов приложения.

В Express мы вручную импортировали готовые объекты:

```ts
import { usersService } from './users.service';
```

`usersService` уже был создан как object literal. Контроллер был жёстко связан
с конкретным объектом.

В Nest контроллер объявляет зависимость в конструкторе:

```ts
constructor(private readonly usersService: UsersService) {}
```

Экземпляр создаёт Nest IoC container. Контроллер знает, что ему нужен
`UsersService`, но не знает, где и в каком порядке его создавать.

## 2. Точка входа

Файл `src/main.ts` содержит bootstrap:

```ts
const app = await NestFactory.create(AppModule);
configureApp(app);
await app.listen(appConfig.port);
```

Последовательность:

1. `NestFactory` читает `AppModule`.
2. Nest рекурсивно читает импортированные модули.
3. IoC container создаёт providers.
4. Контроллеры получают providers через constructor injection.
5. После `listen()` сервер начинает принимать запросы.

`configureApp()` устанавливает глобальный префикс `hometask_13/api`. Поэтому
`@Controller('users')` превращается в `/hometask_13/api/users`.

## 3. AppModule — корень дерева зависимостей

`src/nest/app.module.ts` импортирует:

- `MongooseModule.forRoot(...)` — одно соединение с MongoDB;
- `UsersModule`;
- `BlogsModule`;
- `PostsModule`;
- `CommentsModule`;
- `TestingModule`.

Auth и Security modules здесь отсутствуют. Это и есть реальное «удаление»
функциональности из HTTP-приложения: старые файлы существуют для сравнения, но
Nest о них не знает и маршруты не создаёт.

## 4. Из чего состоит feature module

На примере users:

```ts
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersQueryRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
```

### imports

То, что модуль получает снаружи. `forFeature()` регистрирует Mongoose model в
области видимости этого модуля.

### controllers

Классы, принимающие HTTP-запросы. Контроллер не должен строить Mongo-запросы и
содержать большую бизнес-логику.

### providers

Классы, экземплярами которых управляет IoC container. В нашем случае это
services и repositories.

### exports

Providers, которые разрешено внедрять в другом модуле. Например,
`BlogsRepository` экспортируется из `BlogsModule`, потому что `PostsService`
должен проверить существование блога.

## 5. Декораторы и metadata

Пример контроллера:

```ts
@Controller('blogs')
export class BlogsController {
  @Get(':id')
  getBlog(@Param('id') id: string) {}
}
```

- `@Controller('blogs')` прикрепляет к классу HTTP-префикс.
- `@Get(':id')` связывает метод с GET-маршрутом.
- `@Param('id')` получает path parameter.
- `@Query()` получает query string.
- `@Body()` получает JSON body.
- `@HttpCode(204)` меняет стандартный статус ответа.

Декоратор сохраняет metadata. Настройки `experimentalDecorators` и
`emitDecoratorMetadata` в `tsconfig.json` позволяют Nest прочитать metadata во
время выполнения JavaScript.

Интерфейсы во время выполнения исчезают. Поэтому class можно использовать как
DI token автоматически, а для interface понадобился бы явный token и
`@Inject(TOKEN)`.

## 6. Как работает constructor injection

Цепочка создания для users:

```text
Mongoose connection
  -> Model<User>
    -> UsersRepository
      -> UsersService
        -> UsersController
```

Репозиторий получает модель:

```ts
constructor(
  @InjectModel(User.name)
  private readonly userModel: Model<User>,
) {}
```

Service получает репозиторий:

```ts
constructor(private readonly usersRepository: UsersRepository) {}
```

Controller получает service и query repository. Мы нигде не пишем `new`.

По умолчанию Nest создаёт singleton provider: один экземпляр на всё приложение.

## 7. Mongoose Schema и Model

Schema описана классом:

```ts
@Schema({ collection: 'blogs', versionKey: false })
export class Blog {
  @Prop({ required: true })
  name!: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
```

Здесь есть два разных уровня:

- `Blog` — TypeScript-класс и описание формы документа;
- `BlogSchema` — Mongoose schema, используемая во время выполнения;
- `Model<Blog>` — объект с `find`, `create`, `updateOne`, `deleteOne`.

`!` после имени свойства — definite assignment assertion. Мы сообщаем
TypeScript, что значение установит Mongoose, хотя обычный конструктор его не
присваивает.

Названия коллекций и структура документов сохранены. Поэтому Nest-приложение
может прочитать данные, созданные Express-версией.

## 8. Почему есть Repository и QueryRepository

Repository выполняет команды изменения:

- `create`;
- `updateById`;
- `deleteById`.

QueryRepository строит ответы для чтения:

- фильтрация;
- сортировка;
- пагинация;
- mapping в View DTO.

Это не полный CQRS, но полезное разделение read/write ответственности.

Controller не знает, что данные лежат в MongoDB. Service не знает синтаксис
MongoDB-запросов. Детали Mongoose остаются в repository.

## 9. DTO без валидации

DTO h13 объявлены классами:

```ts
export class CreateBlogDto {
  name!: string;
  description!: string;
  websiteUrl!: string;
}
```

DTO задаёт форму данных для TypeScript, но сам ничего не проверяет. В проекте
нет `ValidationPipe` и декораторов `class-validator`, потому что по заданию
валидация временно не переносится.

Важно: TypeScript не защищает HTTP endpoint во время выполнения. Клиент может
прислать неправильный JSON. В следующем задании validation pipe будет
преобразовывать и проверять входные данные.

## 10. Возврат ответа и исключения

В Express:

```ts
if (!blog) {
  res.sendStatus(404);
  return;
}
res.status(200).json(blog);
```

В Nest:

```ts
if (!blog) {
  throw new NotFoundException();
}
return blog;
```

Nest сам:

1. ловит `HttpException`;
2. выставляет HTTP status;
3. сериализует тело ответа;
4. завершает request.

Для успешного `POST` стандартный статус Nest — 201. Для `DELETE` и `PUT` мы
явно ставим 204 через `@HttpCode(HttpStatus.NO_CONTENT)`.

## 11. Posts, blogs и зависимости между модулями

`PostsService` зависит от `BlogsRepository`, потому что пост не может ссылаться
на несуществующий blog.

`PostsModule` импортирует `BlogsModule`, а `BlogsModule` экспортирует
`BlogsRepository`.

Маршруты `/blogs/:blogId/posts` обслуживает `BlogPostsController`, который
находится в `PostsModule`. Это предотвращает циклическую зависимость
`BlogsModule <-> PostsModule`.

Расположение controller выбирается по его зависимостям и ответственности, а не
только по первой части URL.

## 12. Comments и likes в h13

Разрешены только:

- `GET /comments/:id`;
- `GET /posts/:postId/comments`.

Нет controllers для создания/изменения/удаления комментариев и лайков.

При этом массивы `likes` остались в schemas. Mapper вычисляет:

- `likesCount`;
- `dislikesCount`;
- три последних лайка поста;
- `myStatus`.

Так как Bearer Auth отсутствует, текущий пользователь неизвестен и `myStatus`
всегда равен `None`. Общие счётчики продолжают строиться из данных MongoDB.

## 13. Жизненный цикл одного запроса

Пример `POST /hometask_13/api/posts`:

1. Nest находит `PostsController.createPost()`.
2. `@Body()` передаёт JSON как `CreatePostDto`.
3. Controller вызывает `PostsService.create()`.
4. Service через `BlogsRepository` ищет blog.
5. Если blog отсутствует, controller возвращает 400.
6. Service собирает новый post с `createdAt`, `blogName`, `likes: []`.
7. `PostsRepository` вызывает Mongoose `create()`.
8. Mapper строит публичный `PostViewDto`.
9. Controller возвращает объект.
10. Nest сериализует его и выставляет 201.

## 14. Что проверяет h13 e2e test

`tests/h13.e2e.test.ts` поднимает настоящий Nest application через
`@nestjs/testing` и Supertest.

Проверяются:

- users CRUD без Basic Auth;
- blogs CRUD;
- posts CRUD;
- вложенные blog posts;
- пагинация и поиск;
- чтение comments;
- чтение сохранённых likes/dislikes;
- отсутствие auth/comment-like mutation endpoints;
- очистка базы.

## 15. Команды

```bash
yarn install
yarn build
yarn test:h13
yarn dev
```

Если e2e test не подключается, проверьте `.env.test` и запущенную MongoDB:

```bash
docker compose up -d mongo
yarn test:h13
```

## 16. Что изучать следующим

После этой миграции логичный порядок такой:

1. `ValidationPipe`, `class-validator`, transformation DTO.
2. Guards для Basic/Bearer Auth.
3. Custom decorators для current user.
4. JWT strategy и refresh-token flow.
5. Exception filters и единый формат ошибок.
6. Unit tests providers с mock repositories.
7. Rich domain model и методы Mongoose documents.
8. DIP через interface + injection token, когда появятся альтернативные
   реализации repository.
