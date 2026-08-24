import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../../../modules/comments/dto/comment.view-dto';
import { PostsRepository } from '../../posts/posts.repository';
import { UsersRepository } from '../../users/users.repository';
import { mapCommentToView } from '../comments.mapper';
import { CommentsRepository } from '../comments.repository';
import { CommentDto } from '../dto/comment.dto';

export class CreateCommentCommand { constructor(public readonly postId: string, public readonly userId: string, public readonly dto: CommentDto) {} }
export class UpdateCommentCommand { constructor(public readonly id: string, public readonly userId: string, public readonly dto: CommentDto) {} }
export class DeleteCommentCommand { constructor(public readonly id: string, public readonly userId: string) {} }
export class UpdateCommentLikeCommand { constructor(public readonly id: string, public readonly userId: string, public readonly status: 'None' | 'Like' | 'Dislike') {} }
export type CommentMutationResult = 'success' | 'not-found' | 'forbidden';

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(private readonly comments: CommentsRepository, private readonly posts: PostsRepository, private readonly users: UsersRepository) {}
  async execute({ postId, userId, dto }: CreateCommentCommand): Promise<CommentViewDto | null> {
    if (!(await this.posts.exists(postId))) return null;
    const user = await this.users.findById(userId);
    if (!user) return null;
    const comment = await this.comments.create({ postId, content: dto.content, commentatorInfo: { userId, userLogin: user.login }, createdAt: new Date().toISOString(), likes: [] });
    return mapCommentToView(comment, userId);
  }
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(private readonly comments: CommentsRepository) {}
  async execute({ id, userId, dto }: UpdateCommentCommand): Promise<CommentMutationResult> {
    const comment = await this.comments.findById(id);
    if (!comment) return 'not-found';
    if (comment.commentatorInfo.userId !== userId) return 'forbidden';
    await this.comments.updateContent(id, dto.content);
    return 'success';
  }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(private readonly comments: CommentsRepository) {}
  async execute({ id, userId }: DeleteCommentCommand): Promise<CommentMutationResult> {
    const comment = await this.comments.findById(id);
    if (!comment) return 'not-found';
    if (comment.commentatorInfo.userId !== userId) return 'forbidden';
    await this.comments.deleteById(id);
    return 'success';
  }
}

@CommandHandler(UpdateCommentLikeCommand)
export class UpdateCommentLikeUseCase implements ICommandHandler<UpdateCommentLikeCommand> {
  constructor(private readonly comments: CommentsRepository, private readonly users: UsersRepository) {}
  async execute({ id, userId, status }: UpdateCommentLikeCommand): Promise<boolean> {
    if (!(await this.comments.findById(id))) return false;
    const user = await this.users.findById(userId);
    if (!user) return false;
    return this.comments.updateLikeStatus(id, userId, user.login, status);
  }
}

export const COMMENT_COMMAND_HANDLERS = [CreateCommentUseCase, UpdateCommentUseCase, DeleteCommentUseCase, UpdateCommentLikeUseCase];
