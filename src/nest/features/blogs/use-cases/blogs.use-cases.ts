import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogViewDto } from '../../../../modules/blogs/dto/blog.viewDto';
import { mapBlogToView } from '../blogs.mapper';
import { BlogsRepository } from '../blogs.repository';
import { CreateBlogDto } from '../dto/blog.dto';

export class CreateBlogCommand { constructor(public readonly dto: CreateBlogDto) {} }
export class UpdateBlogCommand { constructor(public readonly id: string, public readonly dto: CreateBlogDto) {} }
export class DeleteBlogCommand { constructor(public readonly id: string) {} }

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly repository: BlogsRepository) {}
  async execute({ dto }: CreateBlogCommand): Promise<BlogViewDto> {
    return mapBlogToView(await this.repository.create({ ...dto, createdAt: new Date().toISOString(), isMembership: false }));
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly repository: BlogsRepository) {}
  execute({ id, dto }: UpdateBlogCommand): Promise<boolean> { return this.repository.updateById(id, dto); }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly repository: BlogsRepository) {}
  execute({ id }: DeleteBlogCommand): Promise<boolean> { return this.repository.deleteById(id); }
}

export const BLOG_COMMAND_HANDLERS = [CreateBlogUseCase, UpdateBlogUseCase, DeleteBlogUseCase];
