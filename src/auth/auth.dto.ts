import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthResponseDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  accessToken: string;
  @ApiProperty({
    type: 'string',
    required: true,
  })
  refreshToken: string;
}

export class AuthRefreshTokenResponseDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  accessToken: string;
}

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

export class AuthParitalSignupDto extends AuthLoginDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty({ message: 'Username name is required' })
  @IsString()
  username: string;
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString({ message: 'Birth date must be a string' })
  @IsNotEmpty({ message: 'Birth date must not be empty' })
  birthDate: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsOptional()
  phoneNumber?: string;
}

export class AuthCompleteSignUpDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name must not be empty' })
  firstName: string;
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name must not be empty' })
  lastName: string;
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number must not be empty' })
  phoneNumber: string;
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString({ message: 'Birth date must be a string' })
  @IsNotEmpty({ message: 'Birth date must not be empty' })
  birthDate: string;
}

export class AuthRefreshTokenDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token must not be empty' })
  refreshToken: string;
}
