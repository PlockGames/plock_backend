import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TagDto {
  @ApiProperty({
    type: 'string',
    description: 'ID of the tag',
  })
  @IsNotEmpty()
  @IsString()
  tagId: string;
}

export class CreatePostDto {
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Content of the post',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class UpdatePostDto {
  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Content of the post',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    type: TagDto,
    isArray: true,
    required: false,
    description: 'Array of tags associated with the post',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags?: TagDto[];
}
