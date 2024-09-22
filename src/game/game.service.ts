import { Injectable } from '@nestjs/common';

import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { GameCreateDto } from './game.dto';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string) {
    return this.prisma.game.findUnique({
      where: { id },
    });
  }

  async create(user: User, game: GameCreateDto) {
    return this.prisma.game.create({
      data: {
        ...game,
        creator: { connect: { id: user.id } },
      },
    });
  }

  async update(id: string, data: Prisma.GameUpdateInput) {
    return this.prisma.game.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.game.delete({
      where: { id },
    });
  }
}
