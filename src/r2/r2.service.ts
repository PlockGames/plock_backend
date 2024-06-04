import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class R2Service {
    private readonly s3Client: S3Client;

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
                        'Authorization': `Bearer ${apiToken}`,
                    };
                }
                return next(args);
            },
            {
                step: 'build', // Add the middleware at the build step
            }
        );
    }

    async uploadFile(bucket: string, key: string, body: Buffer | Uint8Array | Blob | string) {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: 'application/json',
        });
        return this.s3Client.send(command);
    }

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
}
