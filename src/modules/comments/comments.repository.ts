import { ObjectId } from 'mongodb';
import { getDb } from '../../db/mongo-client';
import { CommentDbModel } from './domain/comment.entity';

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