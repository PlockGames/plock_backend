import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';

import { UserService } from './user.service';
import { User, UserRole } from '@prisma/client';
import { UserCreateDto, UserUpdateDto } from './user.dto';
import { ResponseRequest, responseRequest } from '../shared/utils/response';
import { AuthorizedUser } from '../shared/decorators/user-type.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetUsersResponse,
  GetUserResponse,
  CreateUserResponse,
  UpdateUserResponse,
  DeleteUserResponse,
} from '../shared/swagger/responses';
import { Request } from 'express';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(GetUsersResponse)
  @ApiOperation({ summary: 'List all users', description: 'List all users' })
  @AuthorizedUser(UserRole.ADMIN)
  public async list(): Promise<ResponseRequest<Partial<User>[]>> {
    const users = await this.userService.list();
    return responseRequest<Partial<User>[]>('success', 'List of users', users);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(GetUserResponse)
  @ApiOperation({ summary: 'Get user by id', description: 'Get user by id' })
  @AuthorizedUser(UserRole.ADMIN)
  public async get(
    @Param('id') id: string,
  ): Promise<ResponseRequest<Partial<User>>> {
    const user = await this.userService.get(id);
    return responseRequest<Partial<User>>('success', 'User found', user);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(CreateUserResponse)
  @ApiBody({
    description: 'User me',
    type: UserCreateDto,
  })
  @ApiOperation({ summary: 'Create user', description: 'Create user' })
  @AuthorizedUser(UserRole.ADMIN)
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
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(UpdateUserResponse)
  @ApiBody({
    description: 'User me',
    type: UserUpdateDto,
  })
  @ApiOperation({ summary: 'Update user', description: 'Update user' })
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

  @Put('profile/me')
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(UpdateUserResponse)
  @ApiBody({
    description: 'User me',
    type: UserUpdateDto,
  })
  @ApiOperation({ summary: 'Update me', description: 'Update me' })
  public async updateMe(@Req() req: Request, @Body() user: UserUpdateDto) {
    const meUpdated = await this.userService.updateMe(req.user as User, user);
    return responseRequest<Partial<User>>(
      'success',
      'Personal data updated',
      meUpdated,
    );
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(DeleteUserResponse)
  @ApiOperation({ summary: 'Delete user', description: 'Delete user' })
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
