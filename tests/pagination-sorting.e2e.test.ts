import request from 'supertest';
import { app } from '../src/app/app';
import { closeMongoConnection, connectToMongo } from '../src/db/mongo-client';
import {
  adminAuth,
  createBlog,
  createComment,
  createPost,
  createUser,
  loginUser,
  resetDb,
} from './helpers/test-helpers';

describe('Pagination, sorting and search API', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('GET /users should support searchLoginTerm, pageNumber, pageSize and sortDirection', async () => {
    await createUser({ login: 'alice', email: 'alice@example.com' });
    await createUser({ login: 'alex', email: 'alex@example.com' });
    await createUser({ login: 'bob', email: 'bob@example.com' });

    const response = await request(app)
      .get('/users')
      .set(adminAuth)
      .query({
        searchLoginTerm: 'al',
        sortBy: 'login',
        sortDirection: 'asc',
        pageNumber: 1,
        pageSize: 10,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
    });
    expect(response.body.items.map((user: { login: string }) => user.login)).toEqual([
      'alex',
      'alice',
    ]);
  });

  it('GET /users should support searchEmailTerm and pagination', async () => {
    await createUser({ login: 'usera', email: 'person-a@mail.com' });
    await createUser({ login: 'userb', email: 'person-b@mail.com' });
    await createUser({ login: 'userc', email: 'other@mail.com' });

    const response = await request(app)
      .get('/users')
      .set(adminAuth)
      .query({
        searchEmailTerm: 'person',
        sortBy: 'email',
        sortDirection: 'asc',
        pageNumber: 2,
        pageSize: 1,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      pagesCount: 2,
      page: 2,
      pageSize: 1,
      totalCount: 2,
    });
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].email).toBe('person-b@mail.com');
  });

  it('GET /blogs should support searchNameTerm and sorting', async () => {
    await createBlog({ name: 'React', websiteUrl: 'https://react.example.com' });
    await createBlog({ name: 'Node', websiteUrl: 'https://node.example.com' });
    await createBlog({ name: 'Redux', websiteUrl: 'https://redux.example.com' });

    const response = await request(app)
      .get('/blogs')
      .query({
        searchNameTerm: 'Re',
        sortBy: 'name',
        sortDirection: 'desc',
        pageNumber: 1,
        pageSize: 10,
      })
      .expect(200);

    expect(response.body.totalCount).toBe(2);
    expect(response.body.items.map((blog: { name: string }) => blog.name)).toEqual([
      'Redux',
      'React',
    ]);
  });

  it('GET /posts should support pagination and sorting by title', async () => {
    const blog = await createBlog();
    await createPost(blog.id, { title: 'Alpha' });
    await createPost(blog.id, { title: 'Gamma' });
    await createPost(blog.id, { title: 'Beta' });

    const response = await request(app)
      .get('/posts')
      .query({
        sortBy: 'title',
        sortDirection: 'asc',
        pageNumber: 1,
        pageSize: 2,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      pagesCount: 2,
      page: 1,
      pageSize: 2,
      totalCount: 3,
    });
    expect(response.body.items.map((post: { title: string }) => post.title)).toEqual([
      'Alpha',
      'Beta',
    ]);
  });

  it('GET /posts/:postId/comments should support pagination and sorting by content', async () => {
    const blog = await createBlog();
    const post = await createPost(blog.id);
    await createUser({ login: 'author', email: 'author@example.com' });
    const { accessToken } = await loginUser('author');

    await createComment(post.id, accessToken, 'bbbbbbbbbbbbbbbbbbbb');
    await createComment(post.id, accessToken, 'aaaaaaaaaaaaaaaaaaaa');
    await createComment(post.id, accessToken, 'cccccccccccccccccccc');

    const response = await request(app)
      .get(`/posts/${post.id}/comments`)
      .query({
        sortBy: 'content',
        sortDirection: 'asc',
        pageNumber: 2,
        pageSize: 1,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      pagesCount: 3,
      page: 2,
      pageSize: 1,
      totalCount: 3,
    });
    expect(response.body.items[0].content).toBe('bbbbbbbbbbbbbbbbbbbb');
  });
});
