import { Controller, Post, Get, Param, Body, Res } from '@nestjs/common';
import { R2Service } from './r2.service';
import { Response } from 'express';

@Controller('r2')
export class R2Controller {
    constructor(private readonly r2Service: R2Service) { }

    @Post('upload')
    async uploadFile(@Body() body: { bucket: string, key: string, data: any }) {
        const { bucket, key, data } = body;
        const jsonString = JSON.stringify(data);
        const buffer = Buffer.from(jsonString, 'utf-8');
        await this.r2Service.uploadFile(bucket, key, buffer);
        return { message: 'File uploaded successfully' };
    }

    @Get('download/:bucket/:key')
    async downloadFile(@Param('bucket') bucket: string, @Param('key') key: string, @Res() res: Response) {
        const file = await this.r2Service.getFile(bucket, key);
        const jsonString = file.Body.toString('utf-8');
        const data = JSON.parse(jsonString);
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    }
}
