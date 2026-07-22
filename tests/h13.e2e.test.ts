import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../src/nest/app.module';
import { API_PREFIX, configureApp } from '../src/nest/configure-app';
import { CommentEntity } from '../src/nest/features/comments/domain/comment.schema';
import { PostEntity } from '../src/nest/features/posts/domain/post.schema';

const api = `/${API_PREFIX}`;

describe('Hometask 13 NestJS API', () => {
  let app: INestApplication;
  let postModel: Model<PostEntity>;
  let commentModel: Model<CommentEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    postModel = moduleRef.get<Model<PostEntity>>(getModelToken(PostEntity.name));
    commentModel = moduleRef.get<Model<CommentEntity>>(
      getModelToken(CommentEntity.name),
    );
  }, 15_000);

  beforeEach(async () => {
    await request(app.getHttpServer())
      .delete(`${api}/testing/all-data`)
      .expect(204);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('implements users CRUD without Basic Auth', async () => {
    await request(app.getHttpServer())
      .get(`${api}/users`)
      .expect(200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });

    const created = await request(app.getHttpServer())
      .post(`${api}/users`)
      .send({ login: 'alice', password: 'qwerty123', email: 'alice@test.dev' })
      .expect(201);

    expect(created.body).toEqual({
      id: expect.any(String),
      login: 'alice',
      email: 'alice@test.dev',
      createdAt: expect.any(String),
    });

    const page = await request(app.getHttpServer())
      .get(`${api}/users?searchLoginTerm=ALI`)
      .expect(200);
    expect(page.body.totalCount).toBe(1);

    await request(app.getHttpServer())
      .delete(`${api}/users/${created.body.id}`)
      .expect(204);
    await request(app.getHttpServer())
      .delete(`${api}/users/${created.body.id}`)
      .expect(404);
  });

  it('implements blogs CRUD and nested blog posts', async () => {
    const blog = await createBlog();

    await request(app.getHttpServer())
      .get(`${api}/blogs/${blog.id}`)
      .expect(200, blog);

    const post = await request(app.getHttpServer())
      .post(`${api}/blogs/${blog.id}/posts`)
      .send({ title: 'Nest', shortDescription: 'DI', content: 'Modules' })
      .expect(201);

    expect(post.body).toMatchObject({
      title: 'Nest',
      blogId: blog.id,
      blogName: 'Backend blog',
    });

    const postsPage = await request(app.getHttpServer())
      .get(`${api}/blogs/${blog.id}/posts`)
      .expect(200);
    expect(postsPage.body.totalCount).toBe(1);

    await request(app.getHttpServer())
      .put(`${api}/blogs/${blog.id}`)
      .send({
        name: 'Updated blog',
        description: 'Updated description',
        websiteUrl: 'https://updated.dev',
      })
      .expect(204);

    await request(app.getHttpServer())
      .delete(`${api}/blogs/${blog.id}`)
      .expect(204);
  });

  it('implements posts CRUD without Basic Auth', async () => {
    const blog = await createBlog();
    const post = await createPost(blog.id);

    await request(app.getHttpServer())
      .get(`${api}/posts/${post.id}`)
      .expect(200, post);

    await request(app.getHttpServer())
      .put(`${api}/posts/${post.id}`)
      .send({
        title: 'Updated title',
        shortDescription: 'Updated short',
        content: 'Updated content',
        blogId: blog.id,
      })
      .expect(204);

    const page = await request(app.getHttpServer())
      .get(`${api}/posts?pageNumber=1&pageSize=5&sortBy=title&sortDirection=asc`)
      .expect(200);
    expect(page.body.totalCount).toBe(1);
    expect(page.body.items[0].title).toBe('Updated title');

    await request(app.getHttpServer())
      .delete(`${api}/posts/${post.id}`)
      .expect(204);
    await request(app.getHttpServer())
      .get(`${api}/posts/${post.id}`)
      .expect(404);
  });

  it('reads existing comments and likes while mutation routes stay absent', async () => {
    const blog = await createBlog();
    const post = await createPost(blog.id);
    const userId = new Types.ObjectId().toString();

    await postModel.updateOne(
      { _id: post.id },
      {
        $set: {
          likes: [
            {
              userId,
              userLogin: 'reader',
              status: 'Like',
              addedAt: new Date().toISOString(),
            },
          ],
        },
      },
    );

    const comment = await commentModel.create({
      postId: post.id,
      content: 'An existing comment',
      commentatorInfo: { userId, userLogin: 'reader' },
      createdAt: new Date().toISOString(),
      likes: [
        {
          userId: new Types.ObjectId().toString(),
          userLogin: 'another-user',
          status: 'Dislike',
          addedAt: new Date().toISOString(),
        },
      ],
    });

    const postResponse = await request(app.getHttpServer())
      .get(`${api}/posts/${post.id}`)
      .expect(200);
    expect(postResponse.body.extendedLikesInfo).toMatchObject({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: 'None',
    });

    const commentResponse = await request(app.getHttpServer())
      .get(`${api}/comments/${comment._id.toString()}`)
      .expect(200);
    expect(commentResponse.body.likesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 1,
      myStatus: 'None',
    });

    const commentsPage = await request(app.getHttpServer())
      .get(`${api}/posts/${post.id}/comments`)
      .expect(200);
    expect(commentsPage.body.totalCount).toBe(1);

    await request(app.getHttpServer())
      .post(`${api}/posts/${post.id}/comments`)
      .send({ content: 'Not allowed in h13' })
      .expect(404);
    await request(app.getHttpServer())
      .put(`${api}/posts/${post.id}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(404);
    await request(app.getHttpServer())
      .post(`${api}/auth/login`)
      .send({ loginOrEmail: 'alice', password: 'qwerty123' })
      .expect(404);
  });

  async function createBlog() {
    const response = await request(app.getHttpServer())
      .post(`${api}/blogs`)
      .send({
        name: 'Backend blog',
        description: 'NestJS migration',
        websiteUrl: 'https://example.dev',
      })
      .expect(201);

    return response.body as {
      id: string;
      name: string;
      description: string;
      websiteUrl: string;
      createdAt: string;
      isMembership: boolean;
    };
  }

  async function createPost(blogId: string) {
    const response = await request(app.getHttpServer())
      .post(`${api}/posts`)
      .send({
        title: 'Classes',
        shortDescription: 'DI and IoC',
        content: 'Nest providers',
        blogId,
      })
      .expect(201);

    return response.body as {
      id: string;
      title: string;
      shortDescription: string;
      content: string;
      blogId: string;
      blogName: string;
      createdAt: string;
      extendedLikesInfo: object;
    };
  }
});
