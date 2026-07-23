import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createUserSchema,
  CreateUserDto,
  UsersQueryDto,
} from './dto/create-user.dto';
import { UsersQueryRepository } from './users.query-repository';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  getUsers(@Query() query: UsersQueryDto) {
    return this.usersQueryRepository.findAll(query);
  }

  @Post()
  createUser(
    @Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    const isDeleted = await this.usersService.delete(id);

    if (!isDeleted) {
      throw new NotFoundException();
    }
  }
}
