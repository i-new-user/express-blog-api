import { ObjectId } from 'mongodb';
import { getDb } from '../../db/mongo-client';
import { LikeStatus } from '../comments/domain/comment.entity';
import { PostDbModel } from './domain/post.entity';

const getPostsCollection = () => getDb().collection<PostDbModel>('posts');

export const postsRepository = {
  async createPost(post: PostDbModel): Promise<void> {
    await getPostsCollection().insertOne(post);
  },

  async findPostById(id: string): Promise<PostDbModel | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return getPostsCollection().findOne({
      _id: new ObjectId(id),
    });
  },

  async updatePost(
    id: string,
    input: {
      title: string;
      shortDescription: string;
      content: string;
      blogId: string;
      blogName: string;
    },
  ): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const result = await getPostsCollection().updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: input.title,
          shortDescription: input.shortDescription,
          content: input.content,
          blogId: input.blogId,
          blogName: input.blogName,
        },
      },
    );

    return result.matchedCount === 1;
  },

  async updateLikeStatus(
    postId: string,
    userId: string,
    userLogin: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    if (!ObjectId.isValid(postId)) {
      return false;
    }

    const _id = new ObjectId(postId);

    if (likeStatus === 'None') {
      const result = await getPostsCollection().updateOne(
        { _id },
        {
          $pull: {
            likes: { userId },
          },
        },
      );

      return result.matchedCount === 1;
    }

    const addedAt = new Date().toISOString();

    const updateExistingResult = await getPostsCollection().updateOne(
      {
        _id,
        'likes.userId': userId,
      },
      {
        $set: {
          'likes.$.status': likeStatus,
          'likes.$.userLogin': userLogin,
          'likes.$.addedAt': addedAt,
        },
      },
    );

    if (updateExistingResult.matchedCount === 1) {
      return true;
    }

    const addNewResult = await getPostsCollection().updateOne(
      {
        _id,
        'likes.userId': { $ne: userId },
      },
      {
        $push: {
          likes: {
            userId,
            userLogin,
            status: likeStatus,
            addedAt,
          },
        },
      },
    );

    return addNewResult.matchedCount === 1;
  },

  async deletePost(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const result = await getPostsCollection().deleteOne({
      _id: new ObjectId(id),
    });

    return result.deletedCount === 1;
  },
};
