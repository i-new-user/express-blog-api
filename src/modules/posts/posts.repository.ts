import { isValidObjectId } from 'mongoose';
import { LikeStatus } from '../comments/domain/comment.entity';
import { PostDbModel } from './domain/post.entity';
import { PostModel } from './domain/post.model';

export const postsRepository = {
  async createPost(post: PostDbModel): Promise<void> {
    await PostModel.create(post);
  },

  async findPostById(id: string): Promise<PostDbModel | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return PostModel.findById(id).lean();
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
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await PostModel.updateOne(
      { _id: id },
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
    if (!isValidObjectId(postId)) {
      return false;
    }

    if (likeStatus === 'None') {
      const result = await PostModel.updateOne(
        { _id: postId },
        { $pull: { likes: { userId } } },
      );

      return result.matchedCount === 1;
    }

    const addedAt = new Date().toISOString();

    const updateExistingResult = await PostModel.updateOne(
      { _id: postId, 'likes.userId': userId },
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

    const addNewResult = await PostModel.updateOne(
      { _id: postId, 'likes.userId': { $ne: userId } },
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
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await PostModel.deleteOne({ _id: id });

    return result.deletedCount === 1;
  },
};
