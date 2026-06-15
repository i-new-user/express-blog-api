import request from 'supertest';
import { app } from '../src/app/app';
import { closeMongoConnection, connectToMongo } from '../src/db/mongo-client';

const adminAuth = {
  Authorization: `Basic ${Buffer.from('admin:qwerty').toString('base64')}`,
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

describe('Posts API', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });

  beforeEach(async () => {
    await request(app).delete('/testing/all-data').expect(204);
  });

  it('GET /posts should return empty pagination result', async () => {
    const response = await request(app).get('/posts').expect(200);

    expect(response.body).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('POST /posts should return 401 without Basic Auth', async () => {
    const blog = await createBlog();

    await request(app)
      .post('/posts')
      .send({
        title: 'Post 1',
        shortDescription: 'Short description',
        content: 'Content',
        blogId: blog.id,
      })
      .expect(401);
  });

  it('POST /posts should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/posts')
      .set(adminAuth)
      .send({
        title: '',
        shortDescription: '',
        content: '',
        blogId: '',
      })
      .expect(400);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'title' }),
        expect.objectContaining({ field: 'shortDescription' }),
        expect.objectContaining({ field: 'content' }),
        expect.objectContaining({ field: 'blogId' }),
      ]),
    );
  });

  it('POST /posts should return 400 if blogId does not exist', async () => {
    await request(app)
      .post('/posts')
      .set(adminAuth)
      .send({
        title: 'Post 1',
        shortDescription: 'Short description',
        content: 'Content',
        blogId: '666666666666666666666666',
      })
      .expect(400);
  });

  it('POST /posts should create post with valid input', async () => {
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

    expect(response.body).toEqual({
      id: expect.any(String),
      title: 'Post 1',
      shortDescription: 'Short description',
      content: 'Content',
      blogId: blog.id,
      blogName: blog.name,
      createdAt: expect.any(String),
    });
  });

  it('GET /posts/:id should return created post', async () => {
    const blog = await createBlog();

    const createResponse = await request(app)
      .post('/posts')
      .set(adminAuth)
      .send({
        title: 'Post 1',
        shortDescription: 'Short description',
        content: 'Content',
        blogId: blog.id,
      })
      .expect(201);

    const postId = createResponse.body.id;

    const getResponse = await request(app).get(`/posts/${postId}`).expect(200);

    expect(getResponse.body.id).toBe(postId);
    expect(getResponse.body.blogId).toBe(blog.id);
  });

  it('PUT /posts/:id should update post', async () => {
    const blog = await createBlog();

    const createResponse = await request(app)
      .post('/posts')
      .set(adminAuth)
      .send({
        title: 'Post 1',
        shortDescription: 'Short description',
        content: 'Content',
        blogId: blog.id,
      })
      .expect(201);

    const postId = createResponse.body.id;

    await request(app)
      .put(`/posts/${postId}`)
      .set(adminAuth)
      .send({
        title: 'Updated',
        shortDescription: 'Updated short description',
        content: 'Updated content',
        blogId: blog.id,
      })
      .expect(204);

    const getResponse = await request(app).get(`/posts/${postId}`).expect(200);

    expect(getResponse.body.title).toBe('Updated');
    expect(getResponse.body.shortDescription).toBe('Updated short description');
    expect(getResponse.body.content).toBe('Updated content');
  });

  it('DELETE /posts/:id should delete post', async () => {
    const blog = await createBlog();

    const createResponse = await request(app)
      .post('/posts')
      .set(adminAuth)
      .send({
        title: 'Post 1',
        shortDescription: 'Short description',
        content: 'Content',
        blogId: blog.id,
      })
      .expect(201);

    const postId = createResponse.body.id;

    await request(app)
      .delete(`/posts/${postId}`)
      .set(adminAuth)
      .expect(204);

    await request(app).get(`/posts/${postId}`).expect(404);
  });

  it('GET /blogs/:blogId/posts should return posts for blog', async () => {
    const blog = await createBlog();

    await request(app)
      .post(`/blogs/${blog.id}/posts`)
      .set(adminAuth)
      .send({
        title: 'Post 1',
        shortDescription: 'Short description',
        content: 'Content',
      })
      .expect(201);

    const response = await request(app)
      .get(`/blogs/${blog.id}/posts`)
      .expect(200);

    expect(response.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: expect.any(String),
          title: 'Post 1',
          shortDescription: 'Short description',
          content: 'Content',
          blogId: blog.id,
          blogName: blog.name,
          createdAt: expect.any(String),
        },
      ],
    });
  });
});