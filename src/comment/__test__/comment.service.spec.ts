import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from '../comment.service';
import { PrismaService } from '../../shared/modules/prisma/prisma.service';
import { CommentCreateDto, CommentUpdateDto } from '../comment.dto';
import { User } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

describe('CommentService', () => {
  let service: CommentService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: PrismaService,
          useValue: {
            comment: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            game: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCommentsForGame', () => {
    it('should return paginated comments for a game', async () => {
      const gameId = 'game1';
      const mockComments = [
        { id: '1', content: 'Comment 1', gameId },
        { id: '2', content: 'Comment 2', gameId },
      ];

      // Mock the comments query
      prismaService.comment.findMany = jest
        .fn()
        .mockResolvedValue(mockComments);
      prismaService.comment.count = jest
        .fn()
        .mockResolvedValue(mockComments.length);

      // Mock game check for ownership - not needed when no user is provided
      prismaService.game.findUnique = jest.fn();

      const result = await service.getAllCommentsForGame(gameId, 1, 10);

      expect(prismaService.comment.findMany).toHaveBeenCalledWith({
        where: {
          gameId,
        },
        skip: 0,
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              pofilePic: true,
            },
          },
        },
      });
      expect(prismaService.comment.count).toHaveBeenCalledWith({
        where: {
          gameId,
        },
      });
      expect(result).toBeDefined();

      // Update expectation to include isOwner flag
      const expectedCommentsWithOwnerFlag = mockComments.map((comment) => ({
        ...comment,
        isOwner: false,
      }));
      expect(result.data).toEqual(expectedCommentsWithOwnerFlag);
      expect(result.meta.total).toEqual(mockComments.length);
    });

    it('should add isOwner=true when user is the game owner', async () => {
      const gameId = 'game1';
      const userId = 'user1';
      const user = { id: userId } as User;
      const mockComments = [
        { id: '1', content: 'Comment 1', gameId },
        { id: '2', content: 'Comment 2', gameId },
      ];

      // Mock the comments query
      prismaService.comment.findMany = jest
        .fn()
        .mockResolvedValue(mockComments);
      prismaService.comment.count = jest
        .fn()
        .mockResolvedValue(mockComments.length);

      // Mock game check for ownership - return user as owner
      prismaService.game.findUnique = jest.fn().mockResolvedValue({
        id: gameId,
        creatorId: userId,
      });

      const result = await service.getAllCommentsForGame(gameId, 1, 10, user);

      // Update expectation to include isOwner flag as true
      const expectedCommentsWithOwnerFlag = mockComments.map((comment) => ({
        ...comment,
        isOwner: true,
      }));
      expect(result.data).toEqual(expectedCommentsWithOwnerFlag);
    });
  });

  describe('get', () => {
    it('should return a comment by id', async () => {
      const commentId = 'comment1';
      const mockComment = { id: commentId, content: 'Test comment' };

      prismaService.comment.findUnique = jest
        .fn()
        .mockResolvedValue(mockComment);

      const result = await service.get(commentId);

      expect(prismaService.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(result).toEqual(mockComment);
    });

    it('should return null if comment not found', async () => {
      const commentId = 'comment1';

      prismaService.comment.findUnique = jest.fn().mockResolvedValue(null);

      const result = await service.get(commentId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const user: User = { id: 'user1' } as User;
      const gameId = 'game1';
      const commentDto: CommentCreateDto = {
        content: 'New comment',
      };

      const createdComment = {
        id: 'comment1',
        content: commentDto.content,
        userId: user.id,
        gameId,
      };

      prismaService.comment.create = jest
        .fn()
        .mockResolvedValue(createdComment);

      const result = await service.create(user, gameId, commentDto);

      expect(prismaService.comment.create).toHaveBeenCalledWith({
        data: {
          ...commentDto,
          user: {
            connect: {
              id: user.id,
            },
          },
          game: {
            connect: {
              id: gameId,
            },
          },
        },
      });

      expect(result).toEqual(createdComment);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const commentId = 'comment1';
      const updateDto: CommentUpdateDto = {
        content: 'Updated content',
      };

      const updatedComment = {
        id: commentId,
        ...updateDto,
      };

      prismaService.comment.update = jest
        .fn()
        .mockResolvedValue(updatedComment);

      const result = await service.update(commentId, updateDto);

      expect(prismaService.comment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data: updateDto,
      });

      expect(result).toEqual(updatedComment);
    });
  });

  describe('delete', () => {
    it('should delete a comment when user is the game owner', async () => {
      const commentId = 'comment1';
      const user: User = { id: 'user1' } as User;
      const gameId = 'game1';

      // Mock finding the comment
      prismaService.comment.findUnique = jest.fn().mockResolvedValue({
        id: commentId,
        gameId: gameId,
        content: 'Test comment',
      });

      // Mock the game retrieval for ownership check
      prismaService.game.findUnique = jest.fn().mockResolvedValue({
        id: gameId,
        creatorId: user.id, // User is the game owner
      });

      const deletedComment = {
        id: commentId,
        content: 'Deleted comment',
      };

      prismaService.comment.delete = jest
        .fn()
        .mockResolvedValue(deletedComment);

      // Call delete with both required parameters
      const result = await service.delete(commentId, user);

      // Verify comment was looked up to get the gameId
      expect(prismaService.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
        select: { gameId: true },
      });

      // Verify game ownership was checked
      expect(prismaService.game.findUnique).toHaveBeenCalledWith({
        where: { id: gameId },
        select: { creatorId: true },
      });

      // Verify the comment was deleted
      expect(prismaService.comment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
      });

      expect(result).toEqual(deletedComment);
    });

    it('should throw ForbiddenException if user is not the game owner', async () => {
      const commentId = 'comment1';
      const user: User = { id: 'user1' } as User;
      const gameId = 'game1';

      // Mock finding the comment
      prismaService.comment.findUnique = jest.fn().mockResolvedValue({
        id: commentId,
        gameId: gameId,
        content: 'Test comment',
      });

      // Mock the game retrieval for ownership check
      prismaService.game.findUnique = jest.fn().mockResolvedValue({
        id: gameId,
        creatorId: 'different-user-id', // User is NOT the game owner
      });

      // Expect the method to throw an exception
      await expect(service.delete(commentId, user)).rejects.toThrow(
        new ForbiddenException('Only the game owner can delete comments'),
      );

      // Verify the comment was not deleted
      expect(prismaService.comment.delete).not.toHaveBeenCalled();
    });
  });
});
