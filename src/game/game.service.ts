import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { GameCreateDto, GameUpdateDto } from './game.dto';

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
        title: game.title,
        gameUrl: game.gameUrl,
        playTime: game.playTime,
        gameType: game.gameType,
        thumbnailUrl: game.thumbnailUrl,
        creator: { connect: { id: user.id } },
        creationDate: new Date(),
        Taggable: {
          create: game.tags.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: {
        Taggable: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async update(id: string, data: GameUpdateDto) {
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
