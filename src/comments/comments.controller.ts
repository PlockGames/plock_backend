import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

@Controller('comments')
export class CommentsController {
    constructor() { } // Inject Prisma service

    @Get(':id')
    async getCommentById(@Param('id') id: string) {
        return prisma.comment.findUnique({ where: { id: parseInt(id) } });
    }

    @Get('byGame/:gameId')
    async getCommentsByGameId(@Param('gameId') gameId: string) {
        return prisma.comment.findMany({ where: { gameId: gameId } });
    }

    @Post()
    async createComment(@Body() commentData: any) {
        return prisma.comment.create({ data: commentData });
    }

    @Put(':id')
    async updateComment(@Param('id') id: string, @Body() commentData: any) {
        return prisma.comment.update({ where: { id: parseInt(id) }, data: commentData });
    }

    @Delete(':id')
    async deleteComment(@Param('id') id: string) {
        return prisma.comment.delete({ where: { id: parseInt(id) } });
    }
}