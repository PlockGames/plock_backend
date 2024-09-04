import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { UserService } from './user.service';
import { User, UserRole } from '@prisma/client';
import { UserCreateDto, UserUpdateDto } from './user.dto';
import { ResponseRequest, responseRequest } from '../shared/utils/response';
import { AuthorizedUser } from '../shared/decorators/user-type.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @AuthorizedUser(UserRole.ADMIN)
  public async list(): Promise<ResponseRequest<Partial<User>[]>> {
    const users = await this.userService.list();
    return responseRequest<Partial<User>[]>('success', 'List of users', users);
  }

  @Get(':id')
  @AuthorizedUser(UserRole.ADMIN)
  public async get(
    @Param('id') id: string,
  ): Promise<ResponseRequest<Partial<User>>> {
    const user = await this.userService.get(id);
    return responseRequest<Partial<User>>('success', 'User found', user);
  }

  @Post()
  public async create(
    @Body() user: UserCreateDto,
  ): Promise<ResponseRequest<Partial<User>>> {
    const userCreated = await this.userService.create(user);
    return responseRequest<Partial<User>>(
      'success',
      'User created',
      userCreated,
    );
  }

  @Put(':id')
  @AuthorizedUser(UserRole.ADMIN)
  public async update(
    @Param('id') id: string,
    @Body() user: UserUpdateDto,
  ): Promise<ResponseRequest<Partial<User>>> {
    const userUpdated = await this.userService.update(id, user);
    return responseRequest<Partial<User>>(
      'success',
      'User updated',
      userUpdated,
    );
  }

  @Delete(':id')
  @AuthorizedUser(UserRole.ADMIN)
  public async delete(
    @Param('id') id: string,
  ): Promise<ResponseRequest<Partial<User>>> {
    const userDeleted = await this.userService.delete(id);
    return responseRequest<Partial<User>>(
      'success',
      'User deleted',
      userDeleted,
    );
  }
}
