import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
    type: 'string',
    required: false,
    description: 'Description of the game',
  })
  @IsOptional()
  @IsString()
  description?: string;
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
    type: 'string',
    required: false,
    description: 'Description of the game',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
