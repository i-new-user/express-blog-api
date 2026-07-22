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
} from '@nestjs/common';
import { CreateUserDto, UsersQueryDto } from './dto/create-user.dto';
import { UsersQueryRepository } from './users.query-repository';
import { UsersService } from './users.service';

@Controller('users')
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
  createUser(@Body() dto: CreateUserDto) {
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
