import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
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
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  public list(page: number, perPage: number) {
    this.logger.log(`Listing users - Page: ${page}, Per Page: ${perPage}`);
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
    this.logger.log(`Fetching user with ID: ${id}`);
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: prismaExclude('User', ['password', 'refreshToken']),
    });
    if (!user) {
      this.logger.warn(`User not found: ID ${id}`);
      throw new NotFoundException('User not found');
    }
    return user;
  }

  public async create(user: UserCreateDto): Promise<Partial<User>> {
    this.logger.log(`Creating user with email: ${user.email}`);
    return await this.prisma.user.create({
      data: user,
      select: prismaExclude('User', ['password', 'refreshToken']),
    });
  }

  public async update(
    id: string,
    user: UserUpdateDto | AuthCompleteSignUpDto,
  ): Promise<Partial<User>> {
    this.logger.log(`Updating user ID: ${id}`);
    return this.prisma.user.update({
      where: { id },
      data: user,
      select: prismaExclude('User', ['password', 'refreshToken']),
    });
  }

  public async updateMe(user: User, userUpdate: UserUpdateDto) {
    this.logger.log(`Updating user ID: ${user.id}`);
    return this.prisma.user.update({
      where: { id: user.id },
      data: userUpdate,
      select: prismaExclude('User', ['password', 'refreshToken']),
    });
  }

  public async delete(id: string): Promise<Partial<User>> {
    this.logger.log(`Deleting user ID: ${id}`);
    return this.prisma.user.delete({
      where: { id },
      select: prismaExclude('User', ['password', 'refreshToken']),
    });
  }

  public async findByEmail(email: string): Promise<User> {
    this.logger.log(`Finding user by email: ${email}`);
    return this.prisma.user.findUnique({ where: { email } });
  }

  public async updateLastLogin(id: string): Promise<Partial<User>> {
    this.logger.log(`Updating last login for user ID: ${id}`);
    return this.prisma.user.update({
      where: { id },
      data: { lastLogin: new Date().toISOString() },
    });
  }

  public async partialSignUp(authParitalSignupDto: AuthParitalSignupDto) {
    this.logger.log(`Partial signup for email: ${authParitalSignupDto.email}`);
    const hash = await bcrypt.hash(authParitalSignupDto.password, 12);
    try {
      return await this.prisma.user.create({
        data: {
          email: authParitalSignupDto.email,
          password: hash,
          username: authParitalSignupDto.username,
          birthDate: authParitalSignupDto.birthDate,
        },
      });
    } catch (err) {
      this.logger.error('Error during partial signup: ', err);
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          this.logger.warn('Credentials taken: ', authParitalSignupDto.email);
          throw new ForbiddenException('Credentials taken');
        }
      }
    }
  }

  public async searchUsers(user: User, search: string) {
    this.logger.log(`Searching users with query: ${search}`);
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

  public async setRefreshToken(
    id: string,
    refreshToken: string,
  ): Promise<Partial<User>> {
    this.logger.log(`Setting refresh token for user ID: ${id}`);
    return this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }
}
