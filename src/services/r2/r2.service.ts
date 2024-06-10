import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class R2Service {
  private readonly s3Client: S3Client;

  /**
   * Constructs an instance of R2Service and initializes the S3Client with credentials and endpoint.
   * @param {ConfigService} configService - The configuration service to retrieve R2 credentials and endpoint.
   */
  constructor(private configService: ConfigService) {
    const apiToken = this.configService.get<string>('R2_API_TOKEN');

    this.s3Client = new S3Client({
      region: 'auto', // R2 uses 'auto' for region
      endpoint: this.configService.get<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY'),
      },
    });

    this.s3Client.middlewareStack.add(
      (next) => async (args) => {
        if (args.request && typeof args.request === 'object') {
          (args.request as any).headers = {
            ...((args.request as any).headers || {}),
            Authorization: `Bearer ${apiToken}`,
          };
        }
        return next(args);
      },
      {
        step: 'build', // Add the middleware at the build step
      },
    );
  }

  /**
   * Uploads a file to the specified bucket with the given key.
   * @param {string} bucket - The name of the bucket.
   * @param {string} key - The key (path) for the file.
   * @param {Buffer | Uint8Array | Blob | string} body - The content of the file to upload.
   * @returns {Promise<object>} The response from the S3 service.
   */
  async uploadFile(
    bucket: string,
    key: string,
    body: Buffer | Uint8Array | Blob | string,
  ) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: 'application/json',
    });
    return this.s3Client.send(command);
  }

  /**
   * Lists files in the specified bucket with the given prefix.
   * @param {string} bucket - The name of the bucket.
   * @param {string} prefix - The prefix to filter files.
   * @returns {Promise<string[]>} A list of file keys.
   * @throws {Error} If no files are found.
   */
  async listFiles(bucket: string, prefix: string) {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });
    const data = await this.s3Client.send(command);
    if (!data.Contents || data.Contents.length === 0) {
      throw new Error('NoSuchKey: The specified key does not exist.');
    }
    return data.Contents.map((item) => item.Key);
  }

  /**
   * Retrieves a file from the specified bucket with the given key.
   * @param {string} bucket - The name of the bucket.
   * @param {string} key - The key (path) for the file.
   * @returns {Promise<object>} The file content and its content type.
   */
  async getFile(bucket: string, key: string) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await this.s3Client.send(command);
    const { Body } = response;

    // Convert stream to buffer
    const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
      return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    };

    const buffer = await streamToBuffer(Body as Readable);
    return { Body: buffer, ContentType: response.ContentType };
  }

  /**
   * Deletes a file from the specified bucket with the given key.
   * @param {string} bucket - The name of the bucket.
   * @param {string} key - The key (path) for the file.
   * @returns {Promise<object>} The response from the S3 service.
   */
  async deleteFile(bucket: string, key: string) {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return this.s3Client.send(command);
  }

  /**
   * Updates a file in the specified bucket with the given key.
   * @param {string} bucket - The name of the bucket.
   * @param {string} key - The key (path) for the file.
   * @param {Buffer | Uint8Array | Blob | string} body - The new content of the file.
   * @returns {Promise<object>} The response from the S3 service.
   */
  async updateFile(
    bucket: string,
    key: string,
    body: Buffer | Uint8Array | Blob | string,
  ) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: 'application/json',
    });
    return this.s3Client.send(command);
  }
}
