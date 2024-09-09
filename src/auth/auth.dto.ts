import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class AuthSignupDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  @IsString()
  email: string;
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty({ message: 'Username name is required' })
  @IsString()
  username: string;
}

export class AdminDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}
