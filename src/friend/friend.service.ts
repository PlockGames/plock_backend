import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FriendDto } from './friend.dto';

@Injectable()
export class FriendService {
  constructor(
    private readonly userService: UserService,
    private prisma: PrismaService,
  ) {}

  public async searchUsers(user: User, search: string) {
    return this.userService.searchUsers(user, search);
  }

  public async getNotAcceptedFriendsRequests(user: User) {
    return this.prisma.friend.findMany({
      where: {
        friendId: user.id,
        accepted: false,
      },
      include: {
        user: true,
      },
    });
  }

  public async getAcceptedFriends(user: User) {
    const friends = await this.prisma.friend.findMany({
      where: {
        accepted: true,
        OR: [{ userId: user.id }, { friendId: user.id }],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    return friends.map((friend) => {
      let friendReciverOrSender;
      if (friend.userId === user.id) {
        friendReciverOrSender = friend.friend;
      } else {
        friendReciverOrSender = friend.user;
      }
      return { ...friend, user: friendReciverOrSender };
    });
  }

  public async friendRequest(user: User, friendDto: FriendDto) {
    try {
      const userToBeFriend = await this.userService.get(friendDto.userId);
      console.log('userToBeFriend', userToBeFriend.id);
      console.log('user', user.id);

      if (user.id === userToBeFriend.id) {
        console.log('papapapap');

        throw new HttpException(
          'You cannot be friend with yourself',
          HttpStatus.BAD_REQUEST,
        );
      }
      const existingRequest = await this.prisma.friend.findUnique({
        where: {
          userId_friendId: {
            userId: user.id,
            friendId: userToBeFriend.id,
          },
        },
      });
      if (existingRequest) {
        throw new HttpException(
          'Friend request already sent',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.prisma.friend.create({
        data: {
          userId: user.id,
          friendId: userToBeFriend.id,
          accepted: userToBeFriend.isPrivate === false,
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new HttpException(
          'Friend request already sent',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw e;
    }
  }

  public async acceptFriendRequest(user: User, idRequest: string) {
    const friendRequest = await this.prisma.friend.findFirst({
      where: {
        id: idRequest,
        accepted: false,
      },
    });
    if (!friendRequest) {
      throw new HttpException(
        'Friend request not found or already accepted',
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.prisma.friend.update({
      where: {
        id: friendRequest.id,
      },
      data: {
        accepted: true,
      },
    });
  }

  public async deleteFriend(user: User, idRequest: string) {
    const friendship = await this.prisma.friend.findFirst({
      where: {
        id: idRequest,
        accepted: true,
      },
    });
    if (!friendship) {
      throw new HttpException('Friendship not found', HttpStatus.NOT_FOUND);
    }
    return await this.prisma.friend.delete({
      where: {
        id: friendship.id,
      },
    });
  }
}
