import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class UserDto {
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'ID of the user',
  })
  @IsOptional()
  id: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'First name of the user',
  })
  @IsOptional()
  firstName: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Last name of the user',
  })
  @IsOptional()
  lastName: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Email of the user',
  })
  @IsOptional()
  email: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Phone number of the user',
  })
  @IsOptional()
  phoneNumber: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Birth date of the user',
  })
  @IsOptional()
  birthDate: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Role of the user',
  })
  @IsOptional()
  role: UserRole;
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Username of the user',
  })
  @IsOptional()
  username: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Created at date',
  })
  @IsOptional()
  createdAt: string;
  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Updated at date',
  })
  @IsOptional()
  updatedAt: string;
}

export class UserCreateDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'The first name is required' })
  firstName: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'The last name is required' })
  lastName: string;
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsEmail({}, { message: "The email isn't valid" })
  email: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'The password is required' })
  password: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  phoneNumber: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  birthDate: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  username: string;
}

export class UserUpdateDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  firstName: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  lastName: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  phoneNumber: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  birthDate: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  username: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  password: string;
}
