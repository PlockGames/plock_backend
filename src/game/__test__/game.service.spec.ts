import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '../game.service';
import { PrismaService } from '../../shared/modules/prisma/prisma.service';
import { MinioClientService } from '../../shared/modules/minio-client/minio-client.service';
import { GameCreateDto, GameUpdateDto } from '../game.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';
import { Readable } from 'stream';
import { Prisma } from '@prisma/client';

jest.mock('fs');
jest.mock('path');
jest.mock('os');

describe('GameService', () => {
  let service: GameService;
  let prismaService: PrismaService;
  let minioClientService: MinioClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: PrismaService,
          useValue: {
            game: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: MinioClientService,
          useValue: {
            folderExists: jest.fn(),
            uploadJsonFile: jest.fn(),
            updateJsonFile: jest.fn(),
            deleteFolder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    prismaService = module.get<PrismaService>(PrismaService);
    minioClientService = module.get<MinioClientService>(MinioClientService);

    jest.clearAllMocks();

    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('file content'));
    (fs.unlinkSync as jest.Mock).mockImplementation(() => {});
    (path.join as jest.Mock).mockImplementation(() => '/tmp/contentGame.json');
    (tmpdir as jest.Mock).mockReturnValue('/tmp');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllGames', () => {
    it('should return a list of games', async () => {
      const mockGames = [{ id: '1', title: 'Test Game' }];
      prismaService.game.findMany = jest.fn().mockResolvedValue(mockGames);
      prismaService.game.count = jest.fn().mockResolvedValue(1);

      const result = await service.getAllGames(1, 10);

      expect(prismaService.game.findMany).toHaveBeenCalled();
      expect(prismaService.game.count).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.data).toEqual(mockGames);
    });
  });

  describe('getGame', () => {
    it('should return a game by id', async () => {
      const mockGame = { id: '1', title: 'Test Game' };
      prismaService.game.findUnique = jest.fn().mockResolvedValue(mockGame);

      const result = await service.getGame('1');

      expect(prismaService.game.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          Taggable: {
            include: {
              tag: true,
            },
          },
          creator: true,
        },
      });
      expect(result).toEqual(mockGame);
    });

    it('should return null if game not found', async () => {
      prismaService.game.findUnique = jest.fn().mockResolvedValue(null);

      const result = await service.getGame('1');

      expect(result).toBeNull();
    });
  });

  describe('createGame', () => {
    it('should create a new game', async () => {
      const user: User = { id: 'user1' } as User;
      const gameDto: GameCreateDto = {
        title: 'New Game',
        tags: ['tag1'],
        playTime: '30 mins',
        gameType: 'Puzzle',
        thumbnailUrl: 'http://example.com/thumbnail.png',
        contentGame: { data: 'game content' },
      };

      minioClientService.folderExists = jest.fn().mockResolvedValue(false);
      minioClientService.uploadJsonFile = jest
        .fn()
        .mockResolvedValue({ filename: 'contentGame.json' });
      prismaService.game.create = jest.fn().mockResolvedValue({
        id: 'game1',
        ...gameDto,
      });

      const result = await service.createGame(user, gameDto);

      expect(minioClientService.folderExists).toHaveBeenCalledWith(
        `games/${gameDto.title}`,
      );
      expect(minioClientService.uploadJsonFile).toHaveBeenCalled();
      expect(prismaService.game.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw an error if game already exists', async () => {
      const user: User = { id: 'user1' } as User;
      const gameDto: GameCreateDto = {
        title: 'Existing Game',
        tags: ['tag1'],
        playTime: '30 mins',
        gameType: 'Puzzle',
        thumbnailUrl: 'http://example.com/thumbnail.png',
        contentGame: { data: 'game content' },
      };

      minioClientService.folderExists = jest.fn().mockResolvedValue(true);

      await expect(service.createGame(user, gameDto)).rejects.toThrow(
        new HttpException('Game already exists', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('updateGame', () => {
    it('should update an existing game', async () => {
      const gameId = 'game1';
      const gameUpdateDto: GameUpdateDto = {
        title: 'Updated Game',
      };

      const existingGame = {
        id: gameId,
        title: 'Old Game',
        gameUrl: 'http://example.com/oldgame.json',
      };

      service.getGame = jest.fn().mockResolvedValue(existingGame);
      prismaService.game.update = jest.fn().mockResolvedValue({
        id: gameId,
        ...existingGame,
        ...gameUpdateDto,
      });

      const result = await service.updateGame(gameId, gameUpdateDto);

      expect(service.getGame).toHaveBeenCalledWith(gameId);
      expect(prismaService.game.update).toHaveBeenCalledWith({
        where: { id: gameId },
        data: {
          ...gameUpdateDto,
          gameUrl: existingGame.gameUrl,
        },
      });
      expect(result).toBeDefined();
    });

    it('should throw an error if game not found', async () => {
      const gameId = 'game1';
      const gameUpdateDto: GameUpdateDto = {
        title: 'Updated Game',
      };

      service.getGame = jest.fn().mockResolvedValue(null);

      await expect(service.updateGame(gameId, gameUpdateDto)).rejects.toThrow(
        new HttpException('Game not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('deleteGame', () => {
    it('should delete a game', async () => {
      const gameId = 'game1';
      const existingGame = {
        id: gameId,
        title: 'Game to Delete',
      };

      service.getGame = jest.fn().mockResolvedValue(existingGame);
      minioClientService.deleteFolder = jest.fn().mockResolvedValue(undefined);
      prismaService.game.delete = jest.fn().mockResolvedValue(existingGame);

      const result = await service.deleteGame(gameId);

      expect(service.getGame).toHaveBeenCalledWith(gameId);
      expect(minioClientService.deleteFolder).toHaveBeenCalledWith(
        `games/${existingGame.title}`,
      );
      expect(prismaService.game.delete).toHaveBeenCalledWith({
        where: { id: gameId },
      });
      expect(result).toEqual(existingGame);
    });

    it('should throw an error if game not found', async () => {
      const gameId = 'game1';

      service.getGame = jest.fn().mockResolvedValue(null);

      await expect(service.deleteGame(gameId)).rejects.toThrow(
        new HttpException('Game not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
