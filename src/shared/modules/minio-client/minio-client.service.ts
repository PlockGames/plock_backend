import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import * as crypto from 'crypto';
import * as sharp from 'sharp';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  private readonly baseBucket = process.env.MINIO_BUCKET;

  public get client() {
    return this.minio.client;
  }

  constructor(private readonly minio: MinioService) {
    this.logger = new Logger('MinioStorageService');
  }

  public async upload(file: Express.Multer.File, createThumbnail: boolean) {
    try {
      const isImage =
        file.mimetype.includes('jpeg') || file.mimetype.includes('png');
      const isVideo =
        file.mimetype.includes('mp4') ||
        file.mimetype.includes('mov') ||
        file.mimetype.includes('avi');

      if (!isImage && !isVideo) {
        throw new HttpException(
          'Unsupported file type',
          HttpStatus.BAD_REQUEST,
        );
      }

      const temp_filename = Date.now().toString();
      const hashedFileName = crypto
        .createHash('md5')
        .update(temp_filename)
        .digest('hex');
      const ext = path.extname(file.originalname);
      const metaData = {
        'Content-Type': file.mimetype,
      };
      const filename = `${hashedFileName}${ext}`;
      const fileName = `${filename}`;

      await this.client.putObject(
        this.baseBucket,
        fileName,
        file.buffer,
        file.buffer.length,
        metaData,
      );

      let thumbnailFileName: string | undefined;
      // todo fix creation thumbnail
      if (createThumbnail) {
        if (isImage) {
          thumbnailFileName = `thumbnails-${filename}`;
          const thumbnailBuffer = await this.createImageThumbnail(file.buffer);
          await this.client.putObject(
            this.baseBucket,
            thumbnailFileName,
            thumbnailBuffer,
            thumbnailBuffer.length,
            metaData,
          );
        } else if (isVideo) {
          thumbnailFileName = `thumbnails-${filename}.jpg`;
          const thumbnailBuffer = await this.createVideoThumbnail(
            file.buffer,
            thumbnailFileName,
          );
          await this.client.putObject(
            this.baseBucket,
            thumbnailFileName,
            thumbnailBuffer,
            thumbnailBuffer.length,
            { 'Content-Type': 'image/jpeg' },
          );
        }
      }

      return { filename, thumbnailFileName };
    } catch (error) {
      throw new HttpException(
        'Error uploading file, please try again',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async getPresignedUrl(filename: string) {
    return `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${this.baseBucket}/${filename}`;
  }

  public async delete(
    objectName: string,
    baseBucket: string = this.baseBucket,
  ) {
    this.client.removeObject(baseBucket, objectName, {}, (err) => {
      if (err)
        throw new HttpException(
          'Oops Something went wrong',
          HttpStatus.BAD_REQUEST,
        );
    });
  }

  private async createImageThumbnail(buffer: Buffer) {
    return sharp(buffer).resize(200, 200).toBuffer();
  }

  private async createVideoThumbnail(
    buffer: Buffer,
    filename: string,
  ): Promise<Buffer> {
    const tempFilePath = path.join(tmpdir(), `${Date.now()}-temp-video`);
    const outputImagePath = path.join(tmpdir(), filename);

    fs.writeFileSync(tempFilePath, buffer);

    return new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .screenshots({
          count: 1,
          folder: path.dirname(outputImagePath),
          filename: path.basename(outputImagePath),
          size: '320x240',
        })
        .on('end', () => {
          const thumbnailBuffer = fs.readFileSync(outputImagePath);
          fs.unlinkSync(tempFilePath);
          fs.unlinkSync(outputImagePath);
          resolve(thumbnailBuffer);
        })
        .on('error', () => {
          fs.unlinkSync(tempFilePath);
          reject(
            new HttpException(
              'Error creating video thumbnail',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        });
    });
  }

  public async uploadJsonFile(file: Express.Multer.File) {
    try {
      if (file.mimetype !== 'application/json') {
        throw new HttpException(
          'Unsupported file type',
          HttpStatus.BAD_REQUEST,
        );
      }

      const temp_filename = Date.now().toString();
      const hashedFileName = crypto
        .createHash('md5')
        .update(temp_filename)
        .digest('hex');
      const ext = path.extname(file.originalname);
      const metaData = {
        'Content-Type': file.mimetype,
      };
      const filename = `${hashedFileName}${ext}`;

      await this.client.putObject(
        this.baseBucket,
        filename,
        file.buffer,
        file.buffer.length,
        metaData,
      );

      return { filename };
    } catch (error) {
      this.logger.error('Error uploading JSON file: ', error);
      throw new HttpException(
        'Error uploading file, please try again',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
