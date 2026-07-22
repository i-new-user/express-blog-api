# Senior review and refactor notes

## What was changed

1. Replaced the mixed MongoDB access style with one Mongoose-based data layer.
   - Removed native `MongoClient` usage from runtime code.
   - Reworked users, posts, comments and security devices repositories to use Mongoose models.
   - Blogs were already partially on Mongoose; cleaned them up and aligned naming/style.

2. Added domain models for every collection.
   - `user.model.ts`
   - `post.model.ts`
   - `comment.model.ts`
   - `security-device.model.ts`
   - cleaned `blog.model.ts`

3. Moved indexes into schemas.
   - unique `login` and `email`
   - confirmation/recovery code indexes
   - post/comment sorting indexes
   - likes user lookup indexes
   - device indexes and TTL by `expiresAt`

4. Simplified database connection.
   - One Mongoose connection.
   - Removed duplicated native driver + Mongoose connection flow.
   - Added safer connection options and clean shutdown.

5. Unified repositories and query repositories.
   - `findById`, `updateOne`, `deleteOne`, pagination and filtering now follow one style.
   - Read operations use `.lean()` where document methods are not needed.

6. Cleaned application bootstrap and deployment entrypoints.
   - `src/index.ts` now handles startup and graceful shutdown.
   - Docker starts `dist/index.js`.
   - Vercel handler keeps a cached DB connection.

7. Simplified route registration.
   - Removed long repeated route blocks.
   - Homework prefixes are registered through arrays.
   - Auth rate-limit paths are generated from common lists.

8. Updated `.env.example`.
   - Removed duplicates.
   - Added real example values.
   - Kept only variables used by the app.

## Project description

This is a modular REST API backend for a blogging/social homework platform. It supports:

- blogs CRUD;
- posts CRUD;
- creating posts inside blogs;
- comments CRUD;
- comment ownership checks;
- post likes/dislikes with newest likes;
- comment likes/dislikes;
- user registration and admin user creation;
- email confirmation;
- password recovery;
- login/logout/refresh-token flow;
- refresh-token device/session storage;
- listing and deleting active sessions;
- testing cleanup endpoint;
- multiple homework API prefixes for compatibility with automated tests.

## What still should be improved later

1. Add dependency injection instead of importing repositories directly.
2. Split write repositories and read query repositories into classes.
3. Add centralized logger instead of direct `console.log`.
4. Add request id / correlation id middleware.
5. Add stronger production config validation with Zod.
6. Add OpenAPI/Swagger documentation.
7. Add CI pipeline: install → lint → build → test → docker build.
8. Add service-level tests, not only e2e tests.
9. Consider replacing homework-prefix duplication with API versioning once autotests are no longer needed.

## Validation status

I prepared the code for build, but full TypeScript/Jest validation could not be completed inside this sandbox because project dependencies were not installed here. Run locally:

```bash
yarn install
yarn build
yarn test
```

## Test coverage added in this version

Added production-style e2e coverage for the flows that were missing from the previous archive:

- `tests/password-recovery.e2e.test.ts`
  - invalid email validation
  - 204 response for unknown email
  - recovery code persistence
  - invalid recovery code handling
  - successful password change and old password invalidation

- `tests/registration-confirmation.e2e.test.ts`
  - registration creates an unconfirmed user
  - duplicate login/email handling
  - invalid confirmation code handling
  - confirmation by code
  - login blocked before confirmation and allowed after confirmation

- `tests/email-resending.e2e.test.ts`
  - invalid email validation
  - missing email handling
  - already confirmed user handling
  - confirmation code replacement for unconfirmed users

- `tests/refresh-token.e2e.test.ts`
  - invalid refresh cookie handling
  - refresh token rotation
  - old refresh token reuse protection
  - logout invalidates only current session

- `tests/comments-likes.e2e.test.ts`
  - authorization and validation for comment likes
  - Like/Dislike/None transitions
  - duplicate-like protection
  - `myStatus` for anonymous and authorized users
  - likesInfo in comments list

- `tests/posts-likes.e2e.test.ts`
  - authorization and validation for post likes
  - Like/Dislike/None transitions
  - duplicate-like protection
  - `extendedLikesInfo.myStatus`
  - newest three likes ordering

- `tests/pagination-sorting.e2e.test.ts`
  - users search by login/email
  - users pagination and sorting
  - blogs search and sorting
  - posts pagination and sorting
  - comments pagination and sorting

Also added reusable test helpers in `tests/helpers/test-helpers.ts` for creating users, blogs, posts, comments, login sessions, cookies and DB cleanup.

### Important note

The new registration/password-recovery tests mock `emailManager`, so tests verify the API/database flow without depending on a real SMTP server. This is the correct approach for e2e tests in CI: external email delivery should not make API tests flaky.
