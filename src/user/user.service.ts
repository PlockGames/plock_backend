import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { prismaExclude } from '../prisma/prisma-exclude';
import { UserCreateDto, UserUpdateDto } from './user.dto';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  public list(): Promise<Partial<User>[]> {
    return this.prisma.user.findMany({
      select: prismaExclude('User', ['password', 'refreshToken']),
    });
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

  public update(id: string, user: UserUpdateDto): Promise<Partial<User>> {
    return this.prisma.user.update({
      where: { id },
      data: user,
      select: prismaExclude('User', ['password', 'refreshToken']),
    });
  }

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
