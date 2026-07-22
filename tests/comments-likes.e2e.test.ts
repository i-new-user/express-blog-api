import request from 'supertest';
import { app } from '../src/app/app';
import { closeMongoConnection, connectToMongo } from '../src/db/mongo-client';
import {
  createBlog,
  createComment,
  createPost,
  createUser,
  loginUser,
  resetDb,
} from './helpers/test-helpers';

describe('Comment likes API', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });

  beforeEach(async () => {
    await resetDb();
  });

  const createCommentScenario = async () => {
    const blog = await createBlog();
    const post = await createPost(blog.id);

    await createUser({ login: 'owner', email: 'owner@example.com' });
    await createUser({ login: 'liker1', email: 'liker1@example.com' });
    await createUser({ login: 'liker2', email: 'liker2@example.com' });

    const owner = await loginUser('owner');
    const liker1 = await loginUser('liker1');
    const liker2 = await loginUser('liker2');

    const comment = await createComment(post.id, owner.accessToken);

    return { post, comment, owner, liker1, liker2 };
  };

  it('PUT /comments/:commentId/like-status should return 401 without token', async () => {
    const { comment } = await createCommentScenario();

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(401);
  });

  it('PUT /comments/:commentId/like-status should return 400 for invalid status', async () => {
    const { comment, liker1 } = await createCommentScenario();

    const response = await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set({ Authorization: `Bearer ${liker1.accessToken}` })
      .send({ likeStatus: 'BadStatus' })
      .expect(400);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'likeStatus' })]),
    );
  });

  it('PUT /comments/:commentId/like-status should return 404 for missing comment', async () => {
    const { liker1 } = await createCommentScenario();

    await request(app)
      .put('/comments/507f1f77bcf86cd799439011/like-status')
      .set({ Authorization: `Bearer ${liker1.accessToken}` })
      .send({ likeStatus: 'Like' })
      .expect(404);
  });

  it('should count likes/dislikes and return myStatus for current user', async () => {
    const { comment, liker1, liker2 } = await createCommentScenario();

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set({ Authorization: `Bearer ${liker1.accessToken}` })
      .send({ likeStatus: 'Like' })
      .expect(204);

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set({ Authorization: `Bearer ${liker2.accessToken}` })
      .send({ likeStatus: 'Dislike' })
      .expect(204);

    const anonymousResponse = await request(app)
      .get(`/comments/${comment.id}`)
      .expect(200);

    expect(anonymousResponse.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 1,
      myStatus: 'None',
    });

    const liker1Response = await request(app)
      .get(`/comments/${comment.id}`)
      .set({ Authorization: `Bearer ${liker1.accessToken}` })
      .expect(200);

    expect(liker1Response.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 1,
      myStatus: 'Like',
    });
  });

  it('should update previous like status instead of duplicating it', async () => {
    const { comment, liker1 } = await createCommentScenario();

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set({ Authorization: `Bearer ${liker1.accessToken}` })
      .send({ likeStatus: 'Like' })
      .expect(204);

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set({ Authorization: `Bearer ${liker1.accessToken}` })
      .send({ likeStatus: 'Like' })
      .expect(204);

    let response = await request(app).get(`/comments/${comment.id}`).expect(200);

    expect(response.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: 'None',
    });

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set({ Authorization: `Bearer ${liker1.accessToken}` })
      .send({ likeStatus: 'Dislike' })
      .expect(204);

    response = await request(app)
      .get(`/comments/${comment.id}`)
      .set({ Authorization: `Bearer ${liker1.accessToken}` })
      .expect(200);

    expect(response.body.likesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 1,
      myStatus: 'Dislike',
    });

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set({ Authorization: `Bearer ${liker1.accessToken}` })
      .send({ likeStatus: 'None' })
      .expect(204);

    response = await request(app)
      .get(`/comments/${comment.id}`)
      .set({ Authorization: `Bearer ${liker1.accessToken}` })
      .expect(200);

    expect(response.body.likesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    });
  });

  it('GET /posts/:postId/comments should include likesInfo for every comment', async () => {
    const { post, comment, liker1 } = await createCommentScenario();

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set({ Authorization: `Bearer ${liker1.accessToken}` })
      .send({ likeStatus: 'Like' })
      .expect(204);

    const response = await request(app)
      .get(`/posts/${post.id}/comments`)
      .set({ Authorization: `Bearer ${liker1.accessToken}` })
      .expect(200);

    expect(response.body.items[0].likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: 'Like',
    });
  });
});
