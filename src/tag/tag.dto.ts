import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
