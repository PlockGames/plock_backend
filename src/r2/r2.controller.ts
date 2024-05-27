import { Controller, Post, Get, Param, Body, Res } from '@nestjs/common';
import { R2Service } from './r2.service';
import { Response } from 'express';

@Controller('r2')
export class R2Controller {
    constructor(private readonly r2Service: R2Service) { }

    @Post('upload')
    async uploadFile(@Body() body: { bucket: string, key: string, file: string }) {
        const { bucket, key, file } = body;
        const buffer = Buffer.from(file, 'base64');
        await this.r2Service.uploadFile(bucket, key, buffer);
        return { message: 'File uploaded successfully' };
    }

    @Get('download/:bucket/:key')
    async downloadFile(@Param('bucket') bucket: string, @Param('key') key: string, @Res() res: Response) {
        const file = await this.r2Service.getFile(bucket, key);
        // Set appropriate headers and send the file
        res.setHeader('Content-Type', file.ContentType);
        res.send(file.Body);
    }
}
