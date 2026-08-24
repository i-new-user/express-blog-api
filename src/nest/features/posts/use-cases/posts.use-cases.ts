import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../../modules/comments/domain/comment.entity';
import { PostViewDto } from '../../../../modules/posts/dto/post.view-dto';
import { UsersRepository } from '../../users/users.repository';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { CreateBlogPostDto, CreatePostDto } from '../dto/post.dto';
import { mapPostToView } from '../posts.mapper';
import { PostsRepository } from '../posts.repository';

export class CreatePostCommand { constructor(public readonly dto: CreatePostDto, public readonly userId?: string) {} }
export class CreateBlogPostCommand { constructor(public readonly blogId: string, public readonly dto: CreateBlogPostDto, public readonly userId?: string) {} }
export class UpdatePostCommand { constructor(public readonly id: string, public readonly dto: CreatePostDto) {} }
export class DeletePostCommand { constructor(public readonly id: string) {} }
export class UpdatePostLikeCommand { constructor(public readonly postId: string, public readonly userId: string, public readonly status: LikeStatus) {} }

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private readonly posts: PostsRepository, private readonly blogs: BlogsRepository) {}
  async execute({ dto, userId }: CreatePostCommand): Promise<PostViewDto | null> {
    const blog = await this.blogs.findById(dto.blogId);
    if (!blog) return null;
    const post = await this.posts.create({ ...dto, blogId: blog._id.toString(), blogName: blog.name, createdAt: new Date().toISOString(), likes: [] });
    return mapPostToView(post, userId);
  }
}

@CommandHandler(CreateBlogPostCommand)
export class CreateBlogPostUseCase implements ICommandHandler<CreateBlogPostCommand> {
  constructor(private readonly createPost: CreatePostUseCase) {}
  execute({ blogId, dto, userId }: CreateBlogPostCommand) { return this.createPost.execute(new CreatePostCommand({ ...dto, blogId }, userId)); }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private readonly posts: PostsRepository, private readonly blogs: BlogsRepository) {}
  async execute({ id, dto }: UpdatePostCommand): Promise<'success' | 'post-not-found' | 'blog-not-found'> {
    if (!(await this.posts.exists(id))) return 'post-not-found';
    const blog = await this.blogs.findById(dto.blogId);
    if (!blog) return 'blog-not-found';
    await this.posts.updateById(id, { ...dto, blogId: blog._id.toString(), blogName: blog.name });
    return 'success';
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly posts: PostsRepository) {}
  execute({ id }: DeletePostCommand) { return this.posts.deleteById(id); }
}

@CommandHandler(UpdatePostLikeCommand)
export class UpdatePostLikeUseCase implements ICommandHandler<UpdatePostLikeCommand> {
  constructor(private readonly posts: PostsRepository, private readonly users: UsersRepository) {}
  async execute({ postId, userId, status }: UpdatePostLikeCommand): Promise<boolean> {
    if (!(await this.posts.exists(postId))) return false;
    const user = await this.users.findById(userId);
    if (!user) return false;
    return this.posts.updateLikeStatus(postId, userId, user.login, status);
  }
}

export const POST_COMMAND_HANDLERS = [CreatePostUseCase, CreateBlogPostUseCase, UpdatePostUseCase, DeletePostUseCase, UpdatePostLikeUseCase];
