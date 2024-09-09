import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from '../games.controller';
import { PrismaClient } from '@prisma/client';
import { HttpException } from '@nestjs/common';
import { CreateGameDto, UpdateGameDto } from '../game.dto';
import { R2Service } from '../../r2/r2.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('@aws-sdk/client-s3', () => {
  const mS3Client = {
    send: jest.fn(),
    middlewareStack: {
      add: jest.fn(),
    },
  };
  return {
    S3Client: jest.fn(() => mS3Client),
    PutObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
    ListObjectsV2Command: jest.fn(),
  };
});

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    game: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      select: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('GamesController', () => {
  let controller: GamesController;
  let prisma: PrismaClient;
  let r2Service: R2Service;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [PrismaClient, R2Service, ConfigService, PrismaService],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    prisma = module.get<PrismaClient>(PrismaClient);
    r2Service = module.get<R2Service>(R2Service);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getAllGames', () => {
    it('should return an array of games', async () => {
      const result = [{ id: 1, name: 'Game 1' }];
      (prisma.game.findMany as jest.Mock).mockResolvedValue(result);

      expect(await controller.getAllGames()).toBe(result);
      expect(prisma.game.findMany).toHaveBeenCalled();
    });

    it('should throw an exception if there is an error', async () => {
      (prisma.game.findMany as jest.Mock).mockRejectedValue(new Error('Error'));

      await expect(controller.getAllGames()).rejects.toThrow(HttpException);
      expect(prisma.game.findMany).toHaveBeenCalled();
    });
  });

  describe('getGameById', () => {
    it('should return a game by ID', async () => {
      const result = { id: 1, name: 'Game 1' };
      (prisma.game.findUnique as jest.Mock).mockResolvedValue(result);

      expect(await controller.getGameById('1')).toBe(result);
      expect(prisma.game.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw a not found exception if game does not exist', async () => {
      (prisma.game.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(controller.getGameById('1')).rejects.toThrow(HttpException);
      expect(prisma.game.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw an exception if there is an error', async () => {
      (prisma.game.findUnique as jest.Mock).mockRejectedValue(
        new Error('Error'),
      );

      await expect(controller.getGameById('1')).rejects.toThrow(HttpException);
      expect(prisma.game.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('createGame', () => {
    it('should create a new game', async () => {
      const prismadata = {
        creatorId: 1,
        gameType: 'Action',
        tags: ['action', 'truc'],
        playTime: '12345',
        title: 'my game',
        thumbnailUrl: 'https://mygame.com',
      };
      const gameData: CreateGameDto = {
        data: 'my game content',
        ...prismadata,
      };

      const result = { id: 1, likes: 0, ...prismadata };
      (prisma.game.create as jest.Mock).mockResolvedValue(result);
      expect(await controller.createGame(gameData)).toBe(result);
      expect(prisma.game.create).toHaveBeenCalled();
    });

    it('should throw a bad request exception if there is an error', async () => {
      (prisma.game.create as jest.Mock).mockRejectedValue(new Error('Error'));

      await expect(controller.createGame({} as CreateGameDto)).rejects.toThrow(
        HttpException,
      );
      expect(prisma.game.create).toHaveBeenCalled();
    });
  });

  describe('updateGame', () => {
    it('should update an existing game', async () => {
      const gameData: UpdateGameDto = {
        data: 'My great game content',
        gameType: 'Action',
        tags: ['action', 'truc'],
        creatorId: 1,
        likes: 0,
        playTime: '12345',
        thumbnailUrl: 'https://mygame.com',
        title: 'My great game',
      };
      const result = { id: '1', ...gameData };
      (prisma.game.update as jest.Mock).mockResolvedValue(result);
      (prisma.game.findUnique as jest.Mock).mockResolvedValue({ gameData });

      expect(await controller.updateGame('1', gameData)).toBe(result);
      expect(prisma.game.update).toHaveBeenCalled();
    });

    it('should throw a not found exception if game does not exist', async () => {
      const error = new Error();
      (error as any).code = 'P2025';
      (prisma.game.update as jest.Mock).mockRejectedValue(error);

      await expect(
        controller.updateGame('1', {} as UpdateGameDto),
      ).rejects.toThrow(HttpException);
      expect(prisma.game.update).toHaveBeenCalled();
    });

    it('should throw a bad request exception if there is an error', async () => {
      (prisma.game.update as jest.Mock).mockRejectedValue(new Error('Error'));

      await expect(
        controller.updateGame('1', {} as UpdateGameDto),
      ).rejects.toThrow(HttpException);
      expect(prisma.game.update).toHaveBeenCalled();
    });
  });

  describe('deleteGame', () => {
    it('should delete a game', async () => {
      const result = { id: 1, name: 'Game to be deleted' };
      (prisma.game.delete as jest.Mock).mockResolvedValue(result);

      expect(await controller.deleteGame('1')).toBe(result);
      expect(prisma.game.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw a not found exception if game does not exist', async () => {
      const error = new Error();
      (error as any).code = 'P2025';
      (prisma.game.delete as jest.Mock).mockRejectedValue(error);

      await expect(controller.deleteGame('1')).rejects.toThrow(HttpException);
      expect(prisma.game.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw an internal server error if there is an error', async () => {
      (prisma.game.delete as jest.Mock).mockRejectedValue(new Error('Error'));

      await expect(controller.deleteGame('1')).rejects.toThrow(HttpException);
      expect(prisma.game.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
