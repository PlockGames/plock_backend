import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import * as crypto from 'crypto';
import * as sharp from 'sharp';
import * as path from 'path';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  private readonly baseBucket = process.env.MINIO_BUCKET;

  public get client() {
    return this.minio.client;
  }

  constructor(private readonly minio: MinioService) {
    this.logger = new Logger('MinioClientService');
  }

  public async uploadMedia(
    file: Express.Multer.File,
    createThumbnail: boolean,
  ) {
    this.logger.log(`Uploading media file: ${file.originalname}`);
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
        this.logger.warn(`Unsupported file type: ${file.mimetype}`);
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

      this.logger.log(`File uploaded successfully: ${filename}`);

      let thumbnailFileName: string | undefined;

      if (createThumbnail && isImage) {
        thumbnailFileName = `images/thumbnails-${filename}`;
        const thumbnailBuffer = await this.createImageThumbnail(file.buffer);
        await this.client.putObject(
          this.baseBucket,
          thumbnailFileName,
          thumbnailBuffer,
          thumbnailBuffer.length,
          metaData,
        );
        this.logger.log(`Thumbnail created and uploaded: ${thumbnailFileName}`);
      }

      return { filename, thumbnailFileName };
    } catch (error) {
      this.logger.error('Error uploading media file: ', error);
      throw new HttpException(
        'Error uploading file, please try again',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async getPresignedUrl(filename: string) {
    this.logger.log(`Generating presigned URL for file: ${filename}`);
    return `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${this.baseBucket}/${filename}`;
  }

  public async delete(
    objectName: string,
    baseBucket: string = this.baseBucket,
  ) {
    this.logger.log(
      `Deleting object: ${objectName} from bucket: ${baseBucket}`,
    );
    this.client.removeObject(baseBucket, objectName, {}, (err) => {
      if (err) {
        this.logger.error('Error deleting object: ', err);
        throw new HttpException(
          'Oops Something went wrong',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.log(`Object deleted: ${objectName}`);
    });
  }

  private async createImageThumbnail(buffer: Buffer) {
    this.logger.log('Creating image thumbnail');
    return sharp(buffer).resize(200, 200).toBuffer();
  }

  public async uploadJsonFile(
    file: Express.Multer.File,
    gameTitle: string,
    type: string,
  ) {
    this.logger.log(`Uploading JSON file for game: ${gameTitle}`);
    try {
      if (file.mimetype !== 'application/json') {
        this.logger.warn(`Unsupported file type: ${file.mimetype}`);
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

      this.logger.log(`JSON file uploaded successfully: ${filename}`);
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
    this.logger.log(`Updating JSON file for game: ${gameTitle}`);
    try {
      if (existingFileName) {
        this.logger.log(`Deleting existing file: ${existingFileName}`);
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

      this.logger.log(`JSON file updated successfully: ${filename}`);
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
    this.logger.log(`Deleting folder: ${folderName}`);
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
        this.logger.log(`All objects in folder deleted: ${folderName}`);
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
    this.logger.log(`Checking if folder exists: ${folderName}`);
    try {
      const objectsStream = this.client.listObjectsV2(
        this.baseBucket,
        folderName,
        true,
      );

      return new Promise((resolve, reject) => {
        let exists = false;

        objectsStream.on('data', (obj) => {
          if (obj.name.startsWith(folderName)) {
            exists = true;
            resolve(true);
          }
        });

        objectsStream.on('end', () => {
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

  public async uploadMultipleMedia(
    files: Express.Multer.File[],
    gameTitle: string,
    createThumbnail: boolean,
  ): Promise<{ filename: string; thumbnailFileName?: string }[]> {
    this.logger.log(`Uploading multiple media files for game: ${gameTitle}`);
    const uploadResults = [];

    for (const file of files) {
      this.logger.log(`Uploading media file: ${file.originalname}`);
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
          this.logger.warn(`Unsupported file type: ${file.mimetype}`);
          throw new HttpException(
            `Unsupported file type: ${file.mimetype}`,
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
        const filePath = `games/${gameTitle}/${filename}`;

        await this.client.putObject(
          this.baseBucket,
          filePath,
          file.buffer,
          file.buffer.length,
          metaData,
        );

        this.logger.log(`File uploaded successfully: ${filePath}`);

        let thumbnailFileName: string | undefined;

        if (createThumbnail && isImage) {
          thumbnailFileName = `games/${gameTitle}/thumbnails-${filename}`;
          const thumbnailBuffer = await this.createImageThumbnail(file.buffer);

          await this.client.putObject(
            this.baseBucket,
            thumbnailFileName,
            thumbnailBuffer,
            thumbnailBuffer.length,
            metaData,
          );
          this.logger.log(
            `Thumbnail created and uploaded: ${thumbnailFileName}`,
          );
        }

        uploadResults.push({ filename: filePath, thumbnailFileName });
      } catch (error) {
        this.logger.error(`Error uploading file ${file.originalname}: `, error);
        throw new HttpException(
          `Error uploading file ${file.originalname}, please try again`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return uploadResults;
  }
}
