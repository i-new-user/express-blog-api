import { Request, Response } from 'express';
import { postsRepository } from '../posts/posts.repository';
import { commentsQueryRepository } from './comments.query-repository';
import { commentsService } from './comments.service';
import { CommentInputDto } from './dto/comment.input-dto';

export const commentsController = {
  async getCommentById(
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> {
    const comment = await commentsQueryRepository.findCommentById(req.params.id);

    if (!comment) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json(comment);
  },

  async getCommentsByPostId(
    req: Request<{ postId: string }>,
    res: Response,
  ): Promise<void> {
    const post = await postsRepository.findPostById(req.params.postId);

    if (!post) {
      res.sendStatus(404);
      return;
    }

    const result = await commentsQueryRepository.findCommentsByPostId(
      req.params.postId,
      req.query,
    );

    res.status(200).json(result);
  },

  async createCommentForPost(
    req: Request<{ postId: string }, object, CommentInputDto>,
    res: Response,
  ): Promise<void> {
    if (!req.userId) {
      res.sendStatus(401);
      return;
    }

    const createdComment = await commentsService.createComment(
      req.params.postId,
      req.userId,
      req.body,
    );

    if (!createdComment) {
      res.sendStatus(404);
      return;
    }

    res.status(201).json(createdComment);
  },

  async updateComment(
    req: Request<{ commentId: string }, object, CommentInputDto>,
    res: Response,
  ): Promise<void> {
    if (!req.userId) {
      res.sendStatus(401);
      return;
    }

    const result = await commentsService.updateComment(
      req.params.commentId,
      req.userId,
      req.body,
    );

    if (result === 'not-found') {
      res.sendStatus(404);
      return;
    }

    if (result === 'forbidden') {
      res.sendStatus(403);
      return;
    }

    res.sendStatus(204);
  },

  async deleteComment(
    req: Request<{ commentId: string }>,
    res: Response,
  ): Promise<void> {
    if (!req.userId) {
      res.sendStatus(401);
      return;
    }

    const result = await commentsService.deleteComment(
      req.params.commentId,
      req.userId,
    );

    if (result === 'not-found') {
      res.sendStatus(404);
      return;
    }

    if (result === 'forbidden') {
      res.sendStatus(403);
      return;
    }

    res.sendStatus(204);
  },
};