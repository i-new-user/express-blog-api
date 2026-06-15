import request from 'supertest';
import { app } from '../src/app/app';
import { closeMongoConnection, connectToMongo } from '../src/db/mongo-client';

const adminAuth = {
  Authorization: `Basic ${Buffer.from('admin:qwerty').toString('base64')}`,
};

const createUser = async (login: string, email: string) => {
  const response = await request(app)
    .post('/users')
    .set(adminAuth)
    .send({
      login,
      password: 'qwerty',
      email,
    })
    .expect(201);

  return response.body;
};

const loginUser = async (loginOrEmail: string) => {
  const response = await request(app)
    .post('/auth/login')
    .send({
      loginOrEmail,
      password: 'qwerty',
    })
    .expect(200);

  return response.body.accessToken as string;
};

const createBlog = async () => {
  const response = await request(app)
    .post('/blogs')
    .set(adminAuth)
    .send({
      name: 'Blog 1',
      description: 'Blog description',
      websiteUrl: 'https://example.com',
    })
    .expect(201);

  return response.body;
};

const createPost = async () => {
  const blog = await createBlog();

  const response = await request(app)
    .post('/posts')
    .set(adminAuth)
    .send({
      title: 'Post 1',
      shortDescription: 'Short description',
      content: 'Content',
      blogId: blog.id,
    })
    .expect(201);

  return response.body;
};

describe('Comments API', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });

  beforeEach(async () => {
    await request(app).delete('/testing/all-data').expect(204);
  });

  it('POST /posts/:postId/comments should return 401 without token', async () => {
    const post = await createPost();

    await request(app)
      .post(`/posts/${post.id}/comments`)
      .send({
        content: 'This is a valid comment content',
      })
      .expect(401);
  });

  it('POST /posts/:postId/comments should return 400 for invalid content', async () => {
    await createUser('user1', 'user1@example.com');
    const accessToken = await loginUser('user1');
    const post = await createPost();

    const response = await request(app)
      .post(`/posts/${post.id}/comments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        content: 'too short',
      })
      .expect(400);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'content' }),
      ]),
    );
  });

  it('POST /posts/:postId/comments should create comment', async () => {
    const user = await createUser('user1', 'user1@example.com');
    const accessToken = await loginUser('user1');
    const post = await createPost();

    const response = await request(app)
      .post(`/posts/${post.id}/comments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        content: 'This is a valid comment content',
      })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      content: 'This is a valid comment content',
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
      createdAt: expect.any(String),
    });
  });

  it('GET /comments/:id should return comment by id', async () => {
    await createUser('user1', 'user1@example.com');
    const accessToken = await loginUser('user1');
    const post = await createPost();

    const createResponse = await request(app)
      .post(`/posts/${post.id}/comments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        content: 'This is a valid comment content',
      })
      .expect(201);

    const commentId = createResponse.body.id;

    const response = await request(app)
      .get(`/comments/${commentId}`)
      .expect(200);

    expect(response.body.id).toBe(commentId);
    expect(response.body.content).toBe('This is a valid comment content');
  });

  it('GET /posts/:postId/comments should return comments for post', async () => {
    await createUser('user1', 'user1@example.com');
    const accessToken = await loginUser('user1');
    const post = await createPost();

    await request(app)
      .post(`/posts/${post.id}/comments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        content: 'This is a valid comment content',
      })
      .expect(201);

    const response = await request(app)
      .get(`/posts/${post.id}/comments`)
      .expect(200);

    expect(response.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: expect.any(String),
          content: 'This is a valid comment content',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'user1',
          },
          createdAt: expect.any(String),
        },
      ],
    });
  });

  it('PUT /comments/:commentId should update own comment', async () => {
    await createUser('user1', 'user1@example.com');
    const accessToken = await loginUser('user1');
    const post = await createPost();

    const createResponse = await request(app)
      .post(`/posts/${post.id}/comments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        content: 'This is a valid comment content',
      })
      .expect(201);

    const commentId = createResponse.body.id;

    await request(app)
      .put(`/comments/${commentId}`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        content: 'This is updated valid comment content',
      })
      .expect(204);

    const getResponse = await request(app)
      .get(`/comments/${commentId}`)
      .expect(200);

    expect(getResponse.body.content).toBe(
      'This is updated valid comment content',
    );
  });

  it('PUT /comments/:commentId should return 403 for another user comment', async () => {
    await createUser('user1', 'user1@example.com');
    await createUser('user2', 'user2@example.com');

    const user1Token = await loginUser('user1');
    const user2Token = await loginUser('user2');

    const post = await createPost();

    const createResponse = await request(app)
      .post(`/posts/${post.id}/comments`)
      .set({ Authorization: `Bearer ${user1Token}` })
      .send({
        content: 'This is a valid comment content',
      })
      .expect(201);

    await request(app)
      .put(`/comments/${createResponse.body.id}`)
      .set({ Authorization: `Bearer ${user2Token}` })
      .send({
        content: 'This is updated valid comment content',
      })
      .expect(403);
  });

  it('DELETE /comments/:commentId should delete own comment', async () => {
    await createUser('user1', 'user1@example.com');
    const accessToken = await loginUser('user1');
    const post = await createPost();

    const createResponse = await request(app)
      .post(`/posts/${post.id}/comments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        content: 'This is a valid comment content',
      })
      .expect(201);

    const commentId = createResponse.body.id;

    await request(app)
      .delete(`/comments/${commentId}`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(204);

    await request(app).get(`/comments/${commentId}`).expect(404);
  });

  it('DELETE /comments/:commentId should return 403 for another user comment', async () => {
    await createUser('user1', 'user1@example.com');
    await createUser('user2', 'user2@example.com');

    const user1Token = await loginUser('user1');
    const user2Token = await loginUser('user2');

    const post = await createPost();

    const createResponse = await request(app)
      .post(`/posts/${post.id}/comments`)
      .set({ Authorization: `Bearer ${user1Token}` })
      .send({
        content: 'This is a valid comment content',
      })
      .expect(201);

    await request(app)
      .delete(`/comments/${createResponse.body.id}`)
      .set({ Authorization: `Bearer ${user2Token}` })
      .expect(403);
  });
});