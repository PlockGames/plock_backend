import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LikeDto {
  @ApiProperty({
    description: 'The ID of the game to like',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  gameId: string;
}
