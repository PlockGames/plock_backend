import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class R2Service {
    private readonly s3Client: S3Client;

    constructor(private configService: ConfigService) {
        this.s3Client = new S3Client({
            region: 'auto', // Set to 'auto' for Cloudflare R2
            endpoint: 'https://pub-7cb00f11feb143409e4b647431ef24dc.r2.dev'
        });
    }

    async uploadFile(bucket: string, key: string, body: Buffer | Uint8Array | Blob | string) {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
        });
        return this.s3Client.send(command);
    }

    async getFile(bucket: string, key: string) {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        const response = await this.s3Client.send(command);
        // Handle the response appropriately
        return response;
    }
}
