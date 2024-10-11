import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class GameResultDto {
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'ID of the game',
  })
  @IsString()
  id: string;

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Title of the game',
  })
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
    description: 'Playtime of the game',
  })
  @IsString()
  playTime: string;

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Type of the game',
  })
  @IsString()
  gameType: string;

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Thumbnail URL of the game',
  })
  @IsString()
  thumbnailUrl: string;

  @ApiProperty({
    type: 'integer',
    required: true,
    description: 'Number of likes for the game',
  })
  @IsInt()
  likes: number;

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Content game JSON',
  })
  @IsObject()
  contentGame: object;

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Date of creation',
  })
  @IsString()
  createdAt: string;

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Date of update',
  })
  @IsString()
  updatedAt: string;
}

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

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Content game JSON',
  })
  @IsNotEmpty({ message: 'Content game JSON is required' })
  @IsObject()
  contentGame: object;
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
  @IsOptional()
  @IsArray()
  tags: string[];

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

  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Content game JSON',
  })
  @IsOptional()
  @IsObject()
  contentGame?: object;
}
