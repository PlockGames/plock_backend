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

  public async uploadMedia(
    file: Express.Multer.File,
    createThumbnail: boolean,
  ) {
    try {
      const isImage =
        file.mimetype.includes('jpeg') ||
        file.mimetype.includes('png') ||
        file.mimetype.includes('gif') ||
        file.mimetype.includes('webp') ||
        file.mimetype.includes('svg');
      const isVideo =
        file.mimetype.includes('mp4') ||
        file.mimetype.includes('mov') ||
        file.mimetype.includes('avi');
      const isAudio =
        file.mimetype.includes('audio') ||
        file.mimetype.includes('mp3') ||
        file.mimetype.includes('wav');

      if (!isImage && !isVideo && !isAudio) {
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

      if (createThumbnail) {
        if (isImage) {
          thumbnailFileName = `images/thumbnails-${filename}`;
          const thumbnailBuffer = await this.createImageThumbnail(file.buffer);
          await this.client.putObject(
            this.baseBucket,
            thumbnailFileName,
            thumbnailBuffer,
            thumbnailBuffer.length,
            metaData,
          );
        } else if (isVideo) {
          thumbnailFileName = `videos/thumbnails-${filename}.jpg`;
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

  public async uploadJsonFile(
    file: Express.Multer.File,
    gameTitle: string,
    type: string,
  ) {
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
      const filename = `games/${gameTitle}/${type}-${hashedFileName}${ext}`;

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

  public async updateJsonFile(
    file: Express.Multer.File,
    existingFileName: string,
    gameTitle: string,
    type: string,
  ) {
    try {
      if (existingFileName) {
        await this.delete(existingFileName);
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
      const filename = `games/${gameTitle}/${type}-${hashedFileName}${ext}`;

      await this.client.putObject(
        this.baseBucket,
        filename,
        file.buffer,
        file.buffer.length,
        metaData,
      );

      return { filename };
    } catch (error) {
      this.logger.error('Error updating JSON file: ', error);
      throw new HttpException(
        'Error updating file, please try again',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async deleteFolder(folderName: string) {
    try {
      const objectsStream = this.client.listObjectsV2(
        this.baseBucket,
        folderName,
        true,
      );

      const objectsToDelete: string[] = [];

      objectsStream.on('data', (obj) => {
        objectsToDelete.push(obj.name);
      });

      objectsStream.on('error', (err) => {
        this.logger.error('Error listing folder objects: ', err);
        throw new HttpException(
          'Error listing folder objects',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

      objectsStream.on('end', async () => {
        for (const objectName of objectsToDelete) {
          await this.delete(objectName);
        }
      });
    } catch (error) {
      this.logger.error('Error deleting folder: ', error);
      throw new HttpException(
        'Error deleting folder, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async folderExists(folderName: string): Promise<boolean> {
    try {
      // Intentar listar objetos con el prefijo del nombre del folder
      const objectsStream = this.client.listObjectsV2(
        this.baseBucket,
        folderName,
        true,
      );

      return new Promise((resolve, reject) => {
        let exists = false;

        objectsStream.on('data', (obj) => {
          // Si encontramos al menos un objeto, significa que el folder existe
          if (obj.name.startsWith(folderName)) {
            exists = true;
            resolve(true); // Si encontramos algo, resolvemos con true
          }
        });

        objectsStream.on('end', () => {
          // Si no se encontró nada, resolvemos con false
          resolve(exists);
        });

        objectsStream.on('error', (err) => {
          this.logger.error('Error checking folder existence: ', err);
          reject(
            new HttpException(
              'Error checking folder existence',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        });
      });
    } catch (error) {
      this.logger.error('Error checking folder existence: ', error);
      throw new HttpException(
        'Error checking folder existence, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
