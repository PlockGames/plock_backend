import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { R2Service } from '../r2.service';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

// Mock AWS SDK
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

describe('R2Service', () => {
  let service: R2Service;
  let s3Client: S3Client;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        R2Service,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'R2_API_TOKEN':
                  return 'fake-api-token';
                case 'R2_ENDPOINT':
                  return 'https://fake-endpoint';
                case 'R2_ACCESS_KEY_ID':
                  return 'fake-access-key-id';
                case 'R2_SECRET_ACCESS_KEY':
                  return 'fake-secret-access-key';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<R2Service>(R2Service);
    s3Client = new S3Client({}); // get the S3 client instance
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a file', async () => {
      const bucket = 'test-bucket';
      const key = 'test/key';
      const body = JSON.stringify({ foo: 'bar' });

      const mockResponse = {};
      (s3Client.send as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.uploadFile(bucket, key, body);

      expect(result).toBe(mockResponse);
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: 'application/json',
      });
    });
  });

  describe('listFiles', () => {
    it('should list files', async () => {
      const bucket = 'test-bucket';
      const prefix = 'test-prefix/';
      const mockKeys = ['file1', 'file2'];

      const mockResponse = {
        Contents: mockKeys.map((key) => ({ Key: key })),
      };
      (s3Client.send as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.listFiles(bucket, prefix);

      expect(result).toEqual(mockKeys);
      expect(ListObjectsV2Command).toHaveBeenCalledWith({
        Bucket: bucket,
        Prefix: prefix,
      });
    });

    it('should throw an error if no files found', async () => {
      const bucket = 'test-bucket';
      const prefix = 'test-prefix/';

      const mockResponse = {
        Contents: [],
      };
      (s3Client.send as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(service.listFiles(bucket, prefix)).rejects.toThrow(
        'NoSuchKey: The specified key does not exist.',
      );
      expect(ListObjectsV2Command).toHaveBeenCalledWith({
        Bucket: bucket,
        Prefix: prefix,
      });
    });
  });

  describe('getFile', () => {
    it('should get a file', async () => {
      const bucket = 'test-bucket';
      const key = 'test-key';
      const mockBody = Buffer.from('test content');
      const mockStream = new Readable();
      mockStream._read = () => {}; // No-op
      mockStream.push(mockBody);
      mockStream.push(null);

      const mockResponse = {
        Body: mockStream,
        ContentType: 'application/json',
      };
      (s3Client.send as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.getFile(bucket, key);

      expect(result.Body).toEqual(mockBody);
      expect(result.ContentType).toBe('application/json');
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: bucket,
        Key: key,
      });
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      const bucket = 'test-bucket';
      const key = 'test-key';

      const mockResponse = {};
      (s3Client.send as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.deleteFile(bucket, key);

      expect(result).toBe(mockResponse);
      expect(DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: bucket,
        Key: key,
      });
    });
  });

  describe('updateFile', () => {
    it('should update a file', async () => {
      const bucket = 'test-bucket';
      const key = 'test/key';
      const body = JSON.stringify({ foo: 'bar' });

      const mockResponse = {};
      (s3Client.send as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.updateFile(bucket, key, body);

      expect(result).toBe(mockResponse);
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: 'application/json',
      });
    });
  });
});
