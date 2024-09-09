import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FriendDto {
  @ApiProperty({
    description: 'User id',
    type: 'string',
    required: true,
  })
  @IsString({ message: 'userId must be a string' })
  @IsNotEmpty({ message: 'userId is required' })
  userId: string;
}
