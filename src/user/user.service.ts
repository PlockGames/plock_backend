import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { prismaExclude } from '../shared/modules/prisma/prisma-exclude';
import { UserCreateDto, UserDto, UserUpdateDto } from './user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthCompleteSignUpDto, AuthParitalSignupDto } from '../auth/auth.dto';
import * as bcrypt from 'bcrypt';
import { createPaginator } from 'prisma-pagination';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  public list(page: number, perPage: number) {
    const paginate = createPaginator({ perPage });
    return paginate<UserDto, Prisma.UserFindManyArgs>(
      this.prisma.user,
      {
        select: prismaExclude('User', ['password', 'refreshToken']),
      },
      {
        page,
      },
    );
  }

  public async get(id: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: prismaExclude('User', ['password', 'refreshToken']),
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  public create(user: UserCreateDto): Promise<Partial<User>> {
    return this.prisma.user.create({
      data: user,
      select: prismaExclude('User', ['password', 'refreshToken']),
    });
  }

  public update(
    id: string,
    user: UserUpdateDto | AuthCompleteSignUpDto,
  ): Promise<Partial<User>> {
    return this.prisma.user.update({
      where: { id },
      data: user,
      select: prismaExclude('User', ['password', 'refreshToken']),
    });
  }

  public updateMe = async (user: User, userUpdate: UserUpdateDto) => {
    return this.prisma.user.update({
      where: { id: user.id },
      data: userUpdate,
      select: prismaExclude('User', ['password', 'refreshToken']),
    });
  };

  public delete(id: string): Promise<Partial<User>> {
    return this.prisma.user.delete({
      where: { id },
      select: prismaExclude('User', ['password', 'refreshToken']),
    });
  }

  public findByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  public updateLastLogin(id: string): Promise<Partial<User>> {
    return this.prisma.user.update({
      where: { id },
      data: { lastLogin: new Date().toISOString() },
    });
  }

  public async partialSignUp(authParitalSignupDto: AuthParitalSignupDto) {
    const hash = await bcrypt.hash(authParitalSignupDto.password, 12);
    try {
      return await this.prisma.user.create({
        data: {
          email: authParitalSignupDto.email,
          password: hash,
          username: authParitalSignupDto.username,
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
    }
  }

  public async searchUsers(user: User, search: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: search } },
          { username: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
        ],
        NOT: { id: user.id },
      },
      select: prismaExclude('User', ['password', 'refreshToken']),
      take: 5,
    });
  }

  public setRefreshToken(
    id: string,
    refreshToken: string,
  ): Promise<Partial<User>> {
    return this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }
}
