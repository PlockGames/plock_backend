import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient methods
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    game: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('GamesController', () => {
  let controller: GamesController;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    prisma = new PrismaClient();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllGames', () => {
    it('should return all games', async () => {
      const mockGames = [
        { id: 1, title: 'Game 1' },
        { id: 2, title: 'Game 2' },
      ];
      (prisma.game.findMany as jest.Mock).mockResolvedValue(mockGames);

      const result = await controller.getAllGames();
      expect(result).toEqual(mockGames);
    });

    it('should handle errors', async () => {
      (prisma.game.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getAllGames()).rejects.toThrowError(
        'Database error',
      );
    });
  });

  describe('getGameById', () => {
    it('should return a specific game by ID', async () => {
      const mockGame = { id: 1, title: 'Game 1' };
      (prisma.game.findUnique as jest.Mock).mockResolvedValue(mockGame);

      const result = await controller.getGameById('1');
      expect(result).toEqual(mockGame);
    });

    it('should handle non-existent ID', async () => {
      (prisma.game.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await controller.getGameById('999');
      expect(result).toBeNull();
    });

    it('should handle errors', async () => {
      (prisma.game.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getGameById('1')).rejects.toThrowError(
        'Database error',
      );
    });
  });

  describe('createGame', () => {
    it('should create a new game', async () => {
      const newGame = { title: 'New Game', gameId: '1234' };
      (prisma.game.create as jest.Mock).mockResolvedValue(newGame);

      const result = await controller.createGame(newGame);
      expect(result).toEqual(newGame);
    });

    it('should handle errors', async () => {
      const newGame = { title: 'New Game', gameId: '1234' };
      (prisma.game.create as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.createGame(newGame)).rejects.toThrowError(
        'Database error',
      );
    });
  });

  describe('updateGame', () => {
    it('should update an existing game', async () => {
      const updatedGame = { id: 1, title: 'Updated Game' };
      (prisma.game.update as jest.Mock).mockResolvedValue(updatedGame);

      const result = await controller.updateGame('1', updatedGame);
      expect(result).toEqual(updatedGame);
    });

    it('should handle non-existent ID', async () => {
      const updatedGame = { id: 999, title: 'Updated Game' };
      (prisma.game.update as jest.Mock).mockResolvedValue(null);

      const result = await controller.updateGame('999', updatedGame);
      expect(result).toBeNull();
    });

    it('should handle errors', async () => {
      const updatedGame = { id: 1, title: 'Updated Game' };
      (prisma.game.update as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.updateGame('1', updatedGame),
      ).rejects.toThrowError('Database error');
    });
  });

  describe('deleteGame', () => {
    it('should delete a game', async () => {
      (prisma.game.delete as jest.Mock).mockResolvedValue({ id: '1' });

      const result = await controller.deleteGame('1');
      expect(result).toEqual({ id: '1' });
    });

    it('should handle non-existent ID', async () => {
      (prisma.game.delete as jest.Mock).mockResolvedValue(null);

      const result = await controller.deleteGame('999');
      expect(result).toBeNull();
    });

    it('should handle errors', async () => {
      (prisma.game.delete as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.deleteGame('1')).rejects.toThrowError(
        'Database error',
      );
    });
  });
});
