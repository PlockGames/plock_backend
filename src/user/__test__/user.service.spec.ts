import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from '../../shared/modules/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return a user if found', async () => {
      const userMock = { id: '1', email: 'test@example.com' };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(userMock);

      const user = await service.get('1');
      expect(user).toEqual(userMock);
    });

    it('should throw NotFoundException if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.get('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const userCreateDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '1234567890',
        birthDate: '1990-01-01',
        address: '123 Test St',
        city: 'Test City',
        role: UserRole.USER,
        username: 'testuser',
      };
      const userMock = { id: '1', email: 'test@example.com' };
      (prismaService.user.create as jest.Mock).mockResolvedValue(userMock);

      const user = await service.create(userCreateDto);
      expect(user).toEqual(userMock);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: userCreateDto,
        select: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update and return a user', async () => {
      const userUpdateDto = {
        email: 'updated@example.com',
        role: 'user',
        firstName: 'Updated',
        lastName: 'User',
        phoneNumber: '1234567890',
        address: '123 Updated St',
        city: 'Updated City',
        birthDate: '1990-01-01',
        username: 'updateduser',
        password: 'updatedpassword',
      };
      const userMock = { id: '1', email: 'updated@example.com' };
      (prismaService.user.update as jest.Mock).mockResolvedValue(userMock);

      const user = await service.update('1', userUpdateDto);
      expect(user).toEqual(userMock);
    });
  });

  describe('delete', () => {
    it('should delete a user and return it', async () => {
      const userMock = { id: '1', email: 'test@example.com' };
      (prismaService.user.delete as jest.Mock).mockResolvedValue(userMock);

      const user = await service.delete('1');
      expect(user).toEqual(userMock);
    });
  });

  describe('partialSignUp', () => {
    it('should create a user with hashed password', async () => {
      const authPartialSignupDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
        birthDate: '1990-01-01',
      };

      // Mock the bcrypt.hash function to return a specific hash value
      const hashedPassword = 'hashedpassword'; // Use a consistent value for testing
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

      const userMock = { id: '1', email: 'test@example.com' };
      (prismaService.user.create as jest.Mock).mockResolvedValue(userMock);

      const result = await service.partialSignUp(authPartialSignupDto);

      expect(result).toEqual(userMock);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: authPartialSignupDto.email,
          password: hashedPassword, // Use the mocked hashed password
          username: authPartialSignupDto.username,
          birthDate: authPartialSignupDto.birthDate,
        },
      });
    });

    it('should throw ForbiddenException if email is already taken', async () => {
      const authPartialSignupDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
        birthDate: '1990-01-01',
      };
      const error = new PrismaClientKnownRequestError('Error message', {
        code: 'P2002',
        clientVersion: '1.0.0',
      });
      (prismaService.user.create as jest.Mock).mockRejectedValue(error);

      await expect(service.partialSignUp(authPartialSignupDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
