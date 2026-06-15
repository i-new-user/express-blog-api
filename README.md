# Express Blog API

Production-ready REST API built with modern backend architecture using **Express.js**, **TypeScript**, **MongoDB**, **Zod**, **JWT**, **Docker**, and **Clean 3-Layer Architecture**.

## Tech Stack

### Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Native MongoDB Driver
* Zod validation
* JWT Authentication
* bcrypt password hashing
* cookie-parser
* cors

### Testing

* Jest
* Supertest

### DevOps

* Docker
* Docker Compose
* Vercel
* GitHub

---

## Architecture

The project uses a modern **3-layer architecture**:

```txt
Routes
   ↓
Controllers
   ↓
Services (business logic)
   ↓
Repositories (database access)
```

Project structure:

```txt
src/
├── app/
├── common/
│   ├── helpers/
│   ├── middlewares/
│   └── types/
├── config/
├── db/
├── modules/
│   ├── auth/
│   ├── blogs/
│   ├── comments/
│   ├── posts/
│   ├── testing/
│   └── users/
└── main.ts
```

---

## Features

### Blogs

* Create blog
* Update blog
* Delete blog
* Get blogs list
* Pagination
* Search
* Sorting

### Posts

* CRUD operations
* Blog relation
* Pagination
* Search & sorting

### Users

* Registration
* Password hashing with bcrypt
* Unique login/email validation
* Pagination

### Auth

* Login via login/email
* JWT Access Token
* Protected routes
* `/auth/me`

### Comments

* Create comment
* Edit own comment
* Delete own comment
* Authorization checks
* Post comments pagination

---

## Environment Variables

Create `.env`

```env
PORT=3000
MONGO_URL=mongodb://localhost:27017
DB_NAME=express_blog_api

ACCESS_TOKEN_SECRET=your-secret
ACCESS_TOKEN_EXPIRES_IN=10m

REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES=20s

BCRYPT_SALT_ROUNDS=10
CLIENT_URL=http://localhost:5173
```

---

## Installation

### Clone repository

```bash
git clone https://github.com/YOUR_USERNAME/express-blog-api.git
```

### Install dependencies

```bash
yarn install
```

### Run development server

```bash
yarn dev
```

### Run tests

```bash
yarn test
```

---

## Docker

Run MongoDB container:

```bash
docker compose up -d
```

Stop container:

```bash
docker compose down
```

---

## API Testing

Use:

* Postman
* Thunder Client
* Swagger (future)

---

## Testing Coverage

Project includes **integration/e2e tests** with:

* Jest
* Supertest

Tested modules:

* Blogs
* Posts
* Users
* Auth
* Comments

---

## Future Improvements

* Refresh Tokens
* Email confirmation
* Rate limiting
* Swagger/OpenAPI
* Redis
* WebSockets
* Role-based authorization
* CI/CD pipeline

---

## Author

GitHub: https://github.com/gost29090
