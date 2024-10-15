import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TagDto {
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'ID of the tag',
  })
  id: string;

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Name of the tag',
  })
  name: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Creation date of the tag',
  })
  createdAt: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Update date of the tag',
  })
  updatedAt: string;
}

export class TagCreateDto {
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Name of the tag',
  })
  @IsNotEmpty({ message: 'The tag name is required' })
  @IsString()
  name: string;
}

export class TagUpdateDto {
  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Name of the tag',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
