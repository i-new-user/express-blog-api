import request from 'supertest';
import { app } from '../src/app/app';
import { closeMongoConnection, connectToMongo } from '../src/db/mongo-client';
import {
  createBlog,
  createPost,
  createUser,
  delay,
  loginUser,
  resetDb,
} from './helpers/test-helpers';

describe('Post likes API', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });

  beforeEach(async () => {
    await resetDb();
  });

  const createPostScenario = async () => {
    const blog = await createBlog();
    const post = await createPost(blog.id);

    await createUser({ login: 'likeu1', email: 'likeu1@example.com' });
    await createUser({ login: 'likeu2', email: 'likeu2@example.com' });
    await createUser({ login: 'likeu3', email: 'likeu3@example.com' });
    await createUser({ login: 'likeu4', email: 'likeu4@example.com' });

    return {
      post,
      user1: await loginUser('likeu1'),
      user2: await loginUser('likeu2'),
      user3: await loginUser('likeu3'),
      user4: await loginUser('likeu4'),
    };
  };

  it('PUT /posts/:postId/like-status should return 401 without token', async () => {
    const { post } = await createPostScenario();

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(401);
  });

  it('PUT /posts/:postId/like-status should return 400 for invalid status', async () => {
    const { post, user1 } = await createPostScenario();

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set({ Authorization: `Bearer ${user1.accessToken}` })
      .send({ likeStatus: 'Invalid' })
      .expect(400);
  });

  it('should count likes/dislikes and return myStatus', async () => {
    const { post, user1, user2 } = await createPostScenario();

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set({ Authorization: `Bearer ${user1.accessToken}` })
      .send({ likeStatus: 'Like' })
      .expect(204);

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set({ Authorization: `Bearer ${user2.accessToken}` })
      .send({ likeStatus: 'Dislike' })
      .expect(204);

    const anonymousResponse = await request(app).get(`/posts/${post.id}`).expect(200);

    expect(anonymousResponse.body.extendedLikesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 1,
      myStatus: 'None',
      newestLikes: [
        expect.objectContaining({ userId: expect.any(String), login: 'likeu1' }),
      ],
    });

    const user1Response = await request(app)
      .get(`/posts/${post.id}`)
      .set({ Authorization: `Bearer ${user1.accessToken}` })
      .expect(200);

    expect(user1Response.body.extendedLikesInfo.myStatus).toBe('Like');
  });

  it('should keep only three newest likes ordered from newest to oldest', async () => {
    const { post, user1, user2, user3, user4 } = await createPostScenario();

    for (const user of [user1, user2, user3, user4]) {
      await delay(10);
      await request(app)
        .put(`/posts/${post.id}/like-status`)
        .set({ Authorization: `Bearer ${user.accessToken}` })
        .send({ likeStatus: 'Like' })
        .expect(204);
    }

    const response = await request(app).get(`/posts/${post.id}`).expect(200);

    expect(response.body.extendedLikesInfo.likesCount).toBe(4);
    expect(response.body.extendedLikesInfo.newestLikes).toHaveLength(3);
    expect(response.body.extendedLikesInfo.newestLikes.map((like: { login: string }) => like.login)).toEqual([
      'likeu4',
      'likeu3',
      'likeu2',
    ]);
  });

  it('should update previous status and remove status with None', async () => {
    const { post, user1 } = await createPostScenario();

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set({ Authorization: `Bearer ${user1.accessToken}` })
      .send({ likeStatus: 'Like' })
      .expect(204);

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set({ Authorization: `Bearer ${user1.accessToken}` })
      .send({ likeStatus: 'Dislike' })
      .expect(204);

    let response = await request(app)
      .get(`/posts/${post.id}`)
      .set({ Authorization: `Bearer ${user1.accessToken}` })
      .expect(200);

    expect(response.body.extendedLikesInfo.likesCount).toBe(0);
    expect(response.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(response.body.extendedLikesInfo.myStatus).toBe('Dislike');

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set({ Authorization: `Bearer ${user1.accessToken}` })
      .send({ likeStatus: 'None' })
      .expect(204);

    response = await request(app)
      .get(`/posts/${post.id}`)
      .set({ Authorization: `Bearer ${user1.accessToken}` })
      .expect(200);

    expect(response.body.extendedLikesInfo.likesCount).toBe(0);
    expect(response.body.extendedLikesInfo.dislikesCount).toBe(0);
    expect(response.body.extendedLikesInfo.myStatus).toBe('None');
  });
});
