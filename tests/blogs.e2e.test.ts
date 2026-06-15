import request from 'supertest';
import { app } from '../src/app/app';
import { connectToMongo, closeMongoConnection } from '../src/db/mongo-client';

const adminAuth = {
  Authorization: `Basic ${Buffer.from('admin:qwerty').toString('base64')}`,
};

describe('Blogs API', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });

  beforeEach(async () => {
    await request(app).delete('/testing/all-data').expect(204);
  });

  it('GET /blogs should return empty pagination result', async () => {
    const response = await request(app).get('/blogs').expect(200);

    expect(response.body).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('POST /blogs should return 401 without Basic Auth', async () => {
    await request(app)
      .post('/blogs')
      .send({
        name: 'Blog 1',
        description: 'Description',
        websiteUrl: 'https://example.com',
      })
      .expect(401);
  });

  it('POST /blogs should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/blogs')
      .set(adminAuth)
      .send({
        name: '',
        description: '',
        websiteUrl: 'invalid-url',
      })
      .expect(400);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'description' }),
        expect.objectContaining({ field: 'websiteUrl' }),
      ]),
    );
  });

  it('POST /blogs should create blog with valid input', async () => {
    const response = await request(app)
      .post('/blogs')
      .set(adminAuth)
      .send({
        name: 'Blog 1',
        description: 'Description',
        websiteUrl: 'https://example.com',
      })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      name: 'Blog 1',
      description: 'Description',
      websiteUrl: 'https://example.com',
      createdAt: expect.any(String),
      isMembership: false,
    });
  });

  it('GET /blogs/:id should return created blog', async () => {
    const createResponse = await request(app)
      .post('/blogs')
      .set(adminAuth)
      .send({
        name: 'Blog 1',
        description: 'Description',
        websiteUrl: 'https://example.com',
      })
      .expect(201);

    const blogId = createResponse.body.id;

    const getResponse = await request(app).get(`/blogs/${blogId}`).expect(200);

    expect(getResponse.body.id).toBe(blogId);
    expect(getResponse.body.name).toBe('Blog 1');
  });

  it('PUT /blogs/:id should update blog', async () => {
    const createResponse = await request(app)
      .post('/blogs')
      .set(adminAuth)
      .send({
        name: 'Blog 1',
        description: 'Description',
        websiteUrl: 'https://example.com',
      })
      .expect(201);

    const blogId = createResponse.body.id;

    await request(app)
      .put(`/blogs/${blogId}`)
      .set(adminAuth)
      .send({
        name: 'Updated',
        description: 'Updated description',
        websiteUrl: 'https://updated.com',
      })
      .expect(204);

    const getResponse = await request(app).get(`/blogs/${blogId}`).expect(200);

    expect(getResponse.body.name).toBe('Updated');
    expect(getResponse.body.description).toBe('Updated description');
    expect(getResponse.body.websiteUrl).toBe('https://updated.com');
  });

  it('DELETE /blogs/:id should delete blog', async () => {
    const createResponse = await request(app)
      .post('/blogs')
      .set(adminAuth)
      .send({
        name: 'Blog 1',
        description: 'Description',
        websiteUrl: 'https://example.com',
      })
      .expect(201);

    const blogId = createResponse.body.id;

    await request(app)
      .delete(`/blogs/${blogId}`)
      .set(adminAuth)
      .expect(204);

    await request(app).get(`/blogs/${blogId}`).expect(404);
  });
});