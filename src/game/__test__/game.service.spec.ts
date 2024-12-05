jest.mock('@prisma/client', () => {
  const PrismaClientMock = jest.fn(() => ({
    game: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    playHistory: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    media: {
      create: jest.fn(),
    },
  }));
  return { PrismaClient: PrismaClientMock };
});
import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '../game.service';
import { PrismaService } from '../../shared/modules/prisma/prisma.service';
import { MinioClientService } from '../../shared/modules/minio-client/minio-client.service';
import { GameCreateDto, GameUpdateDto, PlayTimeDto } from '../game.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';
import { createPaginator } from 'prisma-pagination';
import { LikeService } from '../../like/like.service';

jest.mock('fs');
jest.mock('path');
jest.mock('os');
jest.mock('prisma-pagination', () => ({
  createPaginator: jest.fn(() => jest.fn()),
}));

describe('GameService', () => {
  let service: GameService;
  let prismaService: PrismaService;
  let minioClientService: MinioClientService;
  let likeService: LikeService;

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
            playHistory: {
              findFirst: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
            media: {
              create: jest.fn(),
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
            uploadMultipleMedia: jest.fn(),
          },
        },
        {
          provide: LikeService,
          useValue: {
            hasLikedGame: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    prismaService = module.get<PrismaService>(PrismaService);
    minioClientService = module.get<MinioClientService>(MinioClientService);
    likeService = module.get<LikeService>(LikeService);

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
    it('should return a list of games with hasLiked property', async () => {
      const mockGamesData = [
        { id: '1', title: 'Test Game 1' },
        { id: '2', title: 'Test Game 2' },
      ];
      const mockPaginate = jest.fn().mockResolvedValue({
        data: mockGamesData,
        meta: {},
      });
      (createPaginator as jest.Mock).mockReturnValue(mockPaginate);
      (likeService.hasLikedGame as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const user: User = { id: 'user1' } as User;

      const result = await service.getAllGames(1, 10, user);

      expect(mockPaginate).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('hasLiked', true);
      expect(result.data[1]).toHaveProperty('hasLiked', false);
    });
  });

  describe('getGame', () => {
    it('should return a game by id with hasLiked property', async () => {
      const mockGame = { id: '1', title: 'Test Game' };
      prismaService.game.findUnique = jest.fn().mockResolvedValue(mockGame);
      (likeService.hasLikedGame as jest.Mock).mockResolvedValue(true);

      const user: User = { id: 'user1' } as User;

      const result = await service.getGame('1', user);

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
      expect(result).toEqual({ ...mockGame, hasLiked: true });
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

      service.getGame = jest.fn().mockImplementation(() => {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      });

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

      service.getGame = jest.fn().mockImplementation(() => {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      });

      await expect(service.deleteGame(gameId)).rejects.toThrow(
        new HttpException('Game not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('recordPlayTime', () => {
    it('should create play time record if not exists', async () => {
      const user: User = { id: 'user1' } as User;
      const gameId = 'game1';
      const playTimeDto: PlayTimeDto = { playTime: 120 };

      prismaService.playHistory.findFirst = jest.fn().mockResolvedValue(null);
      prismaService.playHistory.create = jest.fn();

      const result = await service.recordPlayTime(user, gameId, playTimeDto);

      expect(prismaService.playHistory.findFirst).toHaveBeenCalledWith({
        where: { userId: user.id, gameId },
      });
      expect(prismaService.playHistory.create).toHaveBeenCalledWith({
        data: {
          userId: user.id,
          gameId,
          playTime: playTimeDto.playTime,
        },
      });
      expect(result).toEqual(null);
    });
  });

  describe('uploadGameImages', () => {
    it('should upload images and store media records', async () => {
      const gameId = 'game1';
      const files = [
        {
          path: 'image1.png',
          mimetype: 'image/png',
          size: 1234,
        } as Express.Multer.File,
        {
          path: 'image2.jpg',
          mimetype: 'image/jpeg',
          size: 2345,
        } as Express.Multer.File,
      ];

      const game = {
        id: gameId,
        title: 'Test Game',
        creatorId: 'user1',
      };

      prismaService.game.findUnique = jest.fn().mockResolvedValue(game);
      minioClientService.uploadMultipleMedia = jest
        .fn()
        .mockResolvedValue([
          { filename: 'image1.png' },
          { filename: 'image2.jpg' },
        ]);
      prismaService.media.create = jest.fn().mockResolvedValue({});

      const result = await service.uploadGameImages(gameId, files);

      expect(prismaService.game.findUnique).toHaveBeenCalledWith({
        where: { id: gameId },
        include: { creator: true },
      });
      expect(minioClientService.uploadMultipleMedia).toHaveBeenCalledWith(
        files,
        game.title,
        true,
      );
      expect(prismaService.media.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('should throw an error if game not found', async () => {
      const gameId = 'game1';
      const files = [];

      prismaService.game.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.uploadGameImages(gameId, files)).rejects.toThrow(
        new HttpException('Game not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
