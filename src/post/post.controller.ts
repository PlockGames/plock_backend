import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post as HttpPost,
  Put,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PostService } from './post.service';
import { Request } from 'express';
import { responseRequest } from '../shared/utils/response';
import { User } from '@prisma/client';
import { CreatePostDto, UpdatePostDto } from './post.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Posts')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @HttpPost()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a post',
    description: 'Create a new post',
  })
  @ApiBody({
    description: 'Post details',
    type: CreatePostDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  public async createPost(
    @Body() postDto: CreatePostDto,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const post = await this.postService.createPost(
      req.user as User,
      postDto,
      file,
    );
    return responseRequest('success', 'Post created', post);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a post',
    description: 'Update a post by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    type: 'string',
    required: true,
  })
  @ApiBody({
    description: 'Updated post details',
    type: UpdatePostDto,
  })
  public async updatePost(
    @Param('id') id: string,
    @Body() postDto: UpdatePostDto,
    @Req() req: Request,
  ) {
    const post = await this.postService.updatePost(
      req.user as User,
      id,
      postDto,
    );
    return responseRequest('success', 'Post updated', post);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a post',
    description: 'Delete a post by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    type: 'string',
    required: true,
  })
  public async deletePost(@Param('id') id: string, @Req() req: Request) {
    const post = await this.postService.deletePost(req.user as User, id);
    return responseRequest('success', 'Post deleted', post);
  }
}
