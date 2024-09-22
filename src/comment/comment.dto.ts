import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
