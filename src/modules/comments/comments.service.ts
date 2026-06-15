import { ObjectId } from 'mongodb';
import { postsRepository } from '../posts/posts.repository';
import { usersRepository } from '../users/users.repository';
import { commentsRepository } from './comments.repository';
import { CommentDbModel } from './domain/comment.entity';
import { CommentInputDto } from './dto/comment.input-dto';
import { CommentViewDto } from './dto/comment.view-dto';
import { mapCommentToView } from './comments.mapper';

type CommentMutationResult =
  | { status: 'success' }
  | { status: 'not-found' }
  | { status: 'forbidden' };

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

    return mapCommentToView(newComment);
  },

  async updateComment(
    commentId: string,
    userId: string,
    input: CommentInputDto,
  ): Promise<CommentMutationResult> {
    const comment = await commentsRepository.findCommentById(commentId);

    if (!comment) {
      return { status: 'not-found' };
    }

    if (comment.commentatorInfo.userId !== userId) {
      return { status: 'forbidden' };
    }

    await commentsRepository.updateComment(commentId, input.content);

    return { status: 'success' };
  },

  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<CommentMutationResult> {
    const comment = await commentsRepository.findCommentById(commentId);

    if (!comment) {
      return { status: 'not-found' };
    }

    if (comment.commentatorInfo.userId !== userId) {
      return { status: 'forbidden' };
    }

    await commentsRepository.deleteComment(commentId);

    return { status: 'success' };
  },
};