import { ObjectId } from 'mongodb';
import { postsRepository } from '../posts/posts.repository';
import { usersRepository } from '../users/users.repository';
import { commentsRepository } from './comments.repository';
import { CommentDbModel } from './domain/comment.entity';
import { CommentInputDto } from './dto/comment.input-dto';
import { CommentViewDto } from './dto/comment.view-dto';

export const commentsService = {
  async createComment(
    postId: string,
    userId: string,
    input: CommentInputDto,
  ): Promise<CommentViewDto | null> {
    const post = await postsRepository.findPostById(postId);

    if (!post) {
      return null;
    }

    const user = await usersRepository.findById(userId);

    if (!user) {
      return null;
    }

    const newComment: CommentDbModel = {
      _id: new ObjectId(),
      postId,
      content: input.content,
      commentatorInfo: {
        userId: user._id.toString(),
        userLogin: user.login,
      },
      createdAt: new Date().toISOString(),
    };

    await commentsRepository.createComment(newComment);

    return {
      id: newComment._id.toString(),
      content: newComment.content,
      commentatorInfo: newComment.commentatorInfo,
      createdAt: newComment.createdAt,
    };
  },

  async updateComment(
    commentId: string,
    userId: string,
    input: CommentInputDto,
  ): Promise<'not-found' | 'forbidden' | 'success'> {
    const comment = await commentsRepository.findCommentById(commentId);

    if (!comment) {
      return 'not-found';
    }

    if (comment.commentatorInfo.userId !== userId) {
      return 'forbidden';
    }

    await commentsRepository.updateComment(commentId, input.content);

    return 'success';
  },

  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<'not-found' | 'forbidden' | 'success'> {
    const comment = await commentsRepository.findCommentById(commentId);

    if (!comment) {
      return 'not-found';
    }

    if (comment.commentatorInfo.userId !== userId) {
      return 'forbidden';
    }

    await commentsRepository.deleteComment(commentId);

    return 'success';
  },
};