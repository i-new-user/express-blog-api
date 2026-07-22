import { isValidObjectId } from 'mongoose';
import { CommentDbModel, LikeStatus } from './domain/comment.entity';
import { CommentModel } from './domain/comment.model';

export const commentsRepository = {
  async createComment(comment: CommentDbModel): Promise<void> {
    await CommentModel.create(comment);
  },

  async findCommentById(id: string): Promise<CommentDbModel | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return CommentModel.findById(id).lean();
  },

  async updateComment(id: string, content: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await CommentModel.updateOne(
      { _id: id },
      { $set: { content } },
    );

    return result.matchedCount === 1;
  },

  async updateLikeStatus(
    commentId: string,
    userId: string,
    userLogin: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    if (!isValidObjectId(commentId)) {
      return false;
    }

    if (likeStatus === 'None') {
      const result = await CommentModel.updateOne(
        { _id: commentId },
        { $pull: { likes: { userId } } },
      );

      return result.matchedCount === 1;
    }

    const addedAt = new Date().toISOString();

    const updateExistingResult = await CommentModel.updateOne(
      { _id: commentId, 'likes.userId': userId },
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

    const addNewResult = await CommentModel.updateOne(
      { _id: commentId, 'likes.userId': { $ne: userId } },
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

  async deleteComment(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await CommentModel.deleteOne({ _id: id });

    return result.deletedCount === 1;
  },
};
