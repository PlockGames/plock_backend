import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from '../games.controller';
import { PrismaClient } from '@prisma/client';
import { HttpException } from '@nestjs/common';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    game: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('GamesController', () => {
  let controller: GamesController;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [PrismaClient],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    prisma = module.get<PrismaClient>(PrismaClient);
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
      const gameData = { name: 'New Game' };
      const result = { id: 1, ...gameData };
      (prisma.game.create as jest.Mock).mockResolvedValue(result);

      expect(await controller.createGame(gameData)).toBe(result);
      expect(prisma.game.create).toHaveBeenCalledWith({ data: gameData });
    });

    it('should throw a bad request exception if there is an error', async () => {
      (prisma.game.create as jest.Mock).mockRejectedValue(new Error('Error'));

      await expect(controller.createGame({})).rejects.toThrow(HttpException);
      expect(prisma.game.create).toHaveBeenCalledWith({ data: {} });
    });
  });

  describe('updateGame', () => {
    it('should update an existing game', async () => {
      const gameData = { name: 'Updated Game' };
      const result = { id: 1, ...gameData };
      (prisma.game.update as jest.Mock).mockResolvedValue(result);

      expect(await controller.updateGame('1', gameData)).toBe(result);
      expect(prisma.game.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: gameData,
      });
    });

    it('should throw a not found exception if game does not exist', async () => {
      const error = new Error();
      (error as any).code = 'P2025';
      (prisma.game.update as jest.Mock).mockRejectedValue(error);

      await expect(controller.updateGame('1', {})).rejects.toThrow(
        HttpException,
      );
      expect(prisma.game.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {},
      });
    });

    it('should throw a bad request exception if there is an error', async () => {
      (prisma.game.update as jest.Mock).mockRejectedValue(new Error('Error'));

      await expect(controller.updateGame('1', {})).rejects.toThrow(
        HttpException,
      );
      expect(prisma.game.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {},
      });
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
