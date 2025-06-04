import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommentDto {
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'ID of the comment',
  })
  id: string;

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Content of the comment',
  })
  content: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Creation date of the comment',
  })
  createdAt: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Update date of the comment',
  })
  updatedAt: string;
}

export class CommentCreateDto {
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Content of the comment',
  })
  @IsNotEmpty({ message: 'The content is required' })
  @IsString()
  content: string;
}

export class CommentUpdateDto {
  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Content of the comment',
  })
  @IsString()
  content?: string;
}
