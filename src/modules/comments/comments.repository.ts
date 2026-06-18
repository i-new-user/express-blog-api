import { ObjectId } from 'mongodb';
import { getDb } from '../../db/mongo-client';
import {
  CommentDbModel,
  LikeStatus,
} from './domain/comment.entity';

const getCommentsCollection = () =>
  getDb().collection<CommentDbModel>('comments');

export const commentsRepository = {
  async createComment(comment: CommentDbModel): Promise<void> {
    await getCommentsCollection().insertOne(comment);
  },

  async findCommentById(id: string): Promise<CommentDbModel | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return getCommentsCollection().findOne({
      _id: new ObjectId(id),
    });
  },

  async updateComment(id: string, content: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const result = await getCommentsCollection().updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          content,
        },
      },
    );

    return result.matchedCount === 1;
  },

  async updateLikeStatus(
    commentId: string,
    userId: string,
    userLogin: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    if (!ObjectId.isValid(commentId)) {
      return false;
    }

    const _id = new ObjectId(commentId);

    if (likeStatus === 'None') {
      const result = await getCommentsCollection().updateOne(
        { _id },
        {
          $pull: {
            likes: { userId },
          },
        },
      );

      return result.matchedCount === 1;
    }

    const updateExistingResult = await getCommentsCollection().updateOne(
      {
        _id,
        'likes.userId': userId,
      },
      {
        $set: {
          'likes.$.status': likeStatus,
          'likes.$.userLogin': userLogin,
          'likes.$.addedAt': new Date().toISOString(),
        },
      },
    );

    if (updateExistingResult.matchedCount === 1) {
      return true;
    }

    const addNewResult = await getCommentsCollection().updateOne(
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
            addedAt: new Date().toISOString(),
          },
        },
      },
    );

    return addNewResult.matchedCount === 1;
  },

  async deleteComment(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const result = await getCommentsCollection().deleteOne({
      _id: new ObjectId(id),
    });

    return result.deletedCount === 1;
  },
};