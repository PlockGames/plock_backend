import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FriendService } from './friend.service';
import { User } from '@prisma/client';
import { Request } from 'express';
import { responseRequest } from '../shared/utils/response';
import { FriendDto } from './friend.dto';

@ApiTags('Friends')
@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get('search/:search')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Search users',
    description: 'Search users',
  })
  @ApiParam({
    name: 'search',
    description: 'Search string',
    type: 'string',
    required: true,
  })
  public async searchUsers(
    @Param('search') search: string,
    @Req() req: Request,
  ) {
    const profiles = await this.friendService.searchUsers(
      req.user as User,
      search,
    );
    return responseRequest('success', 'Search results', profiles);
  }

  @Get('me/not-accepted')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List all not accepted friends requests',
    description: 'List all not accepted friends requests',
  })
  public async getNotAcceptedFriendsRequests(@Req() req: Request) {
    const firends = await this.friendService.getNotAcceptedFriendsRequests(
      req.user as User,
    );
    return responseRequest(
      'success',
      'List of not accepted friends requests',
      firends,
    );
  }

  @Get('accepted')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List all accepted friends',
    description: 'List all accepted friends',
  })
  public async getAcceptedFriends(@Req() req: Request) {
    const firends = await this.friendService.getAcceptedFriends(
      req.user as User,
    );
    return responseRequest('success', 'List of accepted friends', firends);
  }

  @Post('send')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Send friend request',
    description: 'Send friend request',
  })
  @ApiBody({
    description: 'Friend request',
    type: FriendDto,
  })
  public async friendRequest(@Body() friend: FriendDto, @Req() req: Request) {
    const friendReuest = await this.friendService.friendRequest(
      req.user as User,
      friend,
    );
    return responseRequest('success', 'Friend request sent', friendReuest);
  }

  @Put('accept/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Accept friend request',
    description: 'Accept friend request',
  })
  @ApiParam({
    name: 'id',
    description: 'Friend request id',
    type: 'string',
    required: true,
  })
  public async acceptFriendRequest(
    @Param('id') idRequest: string,
    @Req() req: Request,
  ) {
    const friendRequest = await this.friendService.acceptFriendRequest(
      req.user as User,
      idRequest,
    );
    return responseRequest('success', 'Friend request accepted', friendRequest);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete friend',
    description: 'Delete friend',
  })
  @ApiParam({
    name: 'id',
    description: 'Friend id',
    type: 'string',
    required: true,
  })
  public async deleteFriend(@Param('id') id: string, @Req() req: Request) {
    const friend = await this.friendService.deleteFriend(req.user as User, id);
    return responseRequest('success', 'Friend deleted', friend);
  }
}
