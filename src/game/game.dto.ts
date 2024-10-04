import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class GameCreateDto {
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Title of the game',
  })
  @IsNotEmpty({ message: 'The title is required' })
  @IsString()
  title: string;

  @ApiProperty({
    type: 'array',
    required: true,
    description: 'Array of tag IDs',
    items: { type: 'string' },
  })
  @IsArray()
  tags: string[];

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'URL of the game',
  })
  @IsNotEmpty({ message: 'The game URL is required' })
  @IsString()
  gameUrl: string;

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Playtime of the game',
  })
  @IsNotEmpty({ message: 'Playtime is required' })
  @IsString()
  playTime: string;

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Type of the game',
  })
  @IsNotEmpty({ message: 'Game type is required' })
  @IsString()
  gameType: string;

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Thumbnail URL of the game',
  })
  @IsNotEmpty({ message: 'Thumbnail URL is required' })
  @IsString()
  thumbnailUrl: string;
}

export class GameUpdateDto {
  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Title of the game',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    type: 'array',
    required: true,
    description: 'Array of tag IDs',
    items: { type: 'string' },
  })
  @IsArray()
  tags: string[];
  @ApiProperty({
    type: 'string',
    required: false,
    description: 'URL of the game',
  })
  @IsOptional()
  @IsString()
  gameUrl?: string;

  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Play time of the game',
  })
  @IsOptional()
  @IsString()
  playTime?: string;

  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Type or genre of the game',
  })
  @IsOptional()
  @IsString()
  gameType?: string;

  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Thumbnail URL of the game',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({
    type: 'integer',
    required: false,
    description: 'Number of likes for the game',
  })
  @IsOptional()
  @IsInt()
  likes?: number;
}
