import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LikeResponseDto {
  @ApiProperty({
    description: 'The ID of the game',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  gameId: string;
  @ApiProperty({
    description: 'The date the like was created',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  createdAt: string;
  @ApiProperty({
    description: 'The date the like was last updated',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  updatedAt: string;
}

export class LikeDto {
  @ApiProperty({
    description: 'The ID of the game to like',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  gameId: string;
}
