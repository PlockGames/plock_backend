// like.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LikeService } from '../like.service';
import { PrismaService } from '../../shared/modules/prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { User } from '@prisma/client';

describe('LikeService', () => {
  let service: LikeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeService,
        {
          provide: PrismaService,
          useValue: {
            like: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            game: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LikeService>(LikeService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('likeGame', () => {
    it('should like a game successfully', async () => {
      const user: User = { id: 'user1' } as User;
      const gameId = 'game1';

      prismaService.like.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.like.create = jest.fn().mockResolvedValue({
        userId: user.id,
        gameId,
      });
      prismaService.game.update = jest.fn().mockResolvedValue({});

      await service.likeGame(user, gameId);

      expect(prismaService.like.findUnique).toHaveBeenCalledWith({
        where: {
          userId_gameId: { userId: user.id, gameId },
        },
      });
      expect(prismaService.like.create).toHaveBeenCalledWith({
        data: {
          userId: user.id,
          gameId,
        },
      });
      expect(prismaService.game.update).toHaveBeenCalledWith({
        where: { id: gameId },
        data: { likes: { increment: 1 } },
      });
    });

    it('should throw an error if the user has already liked the game', async () => {
      const user: User = { id: 'user1' } as User;
      const gameId = 'game1';

      prismaService.like.findUnique = jest.fn().mockResolvedValue({
        userId: user.id,
        gameId,
      });

      await expect(service.likeGame(user, gameId)).rejects.toThrow(
        new ForbiddenException('You have already liked this game'),
      );

      expect(prismaService.like.findUnique).toHaveBeenCalledWith({
        where: {
          userId_gameId: { userId: user.id, gameId },
        },
      });
      expect(prismaService.like.create).not.toHaveBeenCalled();
      expect(prismaService.game.update).not.toHaveBeenCalled();
    });
  });

  describe('unlikeGame', () => {
    it('should unlike a game successfully', async () => {
      const user: User = { id: 'user1' } as User;
      const gameId = 'game1';

      prismaService.like.findUnique = jest.fn().mockResolvedValue({
        userId: user.id,
        gameId,
      });
      prismaService.like.delete = jest.fn().mockResolvedValue({});
      prismaService.game.update = jest.fn().mockResolvedValue({});

      await service.unlikeGame(user, gameId);

      expect(prismaService.like.findUnique).toHaveBeenCalledWith({
        where: {
          userId_gameId: { userId: user.id, gameId },
        },
      });
      expect(prismaService.like.delete).toHaveBeenCalledWith({
        where: {
          userId_gameId: { userId: user.id, gameId },
        },
      });
      expect(prismaService.game.update).toHaveBeenCalledWith({
        where: { id: gameId },
        data: { likes: { decrement: 1 } },
      });
    });

    it('should throw an error if the user has not liked the game', async () => {
      const user: User = { id: 'user1' } as User;
      const gameId = 'game1';

      prismaService.like.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.unlikeGame(user, gameId)).rejects.toThrow(
        new ForbiddenException('You have not liked this game'),
      );

      expect(prismaService.like.findUnique).toHaveBeenCalledWith({
        where: {
          userId_gameId: { userId: user.id, gameId },
        },
      });
      expect(prismaService.like.delete).not.toHaveBeenCalled();
      expect(prismaService.game.update).not.toHaveBeenCalled();
    });
  });

  describe('countLikes', () => {
    it('should return the total number of likes for a game', async () => {
      const gameId = 'game1';
      const totalLikes = 5;

      prismaService.like.count = jest.fn().mockResolvedValue(totalLikes);

      const result = await service.countLikes(gameId);

      expect(prismaService.like.count).toHaveBeenCalledWith({
        where: { gameId },
      });
      expect(result).toEqual(totalLikes);
    });
  });
});
