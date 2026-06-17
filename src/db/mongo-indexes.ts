import { Db } from 'mongodb';

export const createMongoIndexes = async (db: Db): Promise<void> => {
  await Promise.all([
    db.collection('users').createIndex(
      { login: 1 },
      {
        unique: true,
        name: 'users_unique_login_idx',
      },
    ),

    db.collection('users').createIndex(
      { email: 1 },
      {
        unique: true,
        name: 'users_unique_email_idx',
      },
    ),

    db.collection('users').createIndex(
      { 'emailConfirmation.recoveryCode': 1 },
      { name: 'users_recovery_code_idx' }
    ),

    db.collection('blogs').createIndex(
      { createdAt: -1 },
      {
        name: 'blogs_created_at_idx',
      },
    ),

    db.collection('posts').createIndex(
      { createdAt: -1 },
      {
        name: 'posts_created_at_idx',
      },
    ),

    db.collection('posts').createIndex(
      { blogId: 1, createdAt: -1 },
      {
        name: 'posts_blog_id_created_at_idx',
      },
    ),

    db.collection('comments').createIndex(
      { postId: 1, createdAt: -1 },
      {
        name: 'comments_post_id_created_at_idx',
      },
    ),

    db.collection('users').createIndex(
      { 'emailConfirmation.confirmationCode': 1 },
      {
        name: 'users_confirmation_code_idx',
      },
    ),
  ]);
};