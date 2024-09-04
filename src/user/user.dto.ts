import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class UserCreateDto {
  @IsOptional()
  @IsNotEmpty({ message: 'The first name is required' })
  firstName: string;
  @IsOptional()
  @IsNotEmpty({ message: 'The last name is required' })
  lastName: string;
  @IsEmail({}, { message: "The email isn't valid" })
  email: string;
  @IsOptional()
  @IsNotEmpty({ message: 'The password is required' })
  password: string;
  @IsOptional()
  phoneNumber: string;
  @IsOptional()
  birthDate: string;
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
  @IsOptional()
  username: string;
}

export class UserUpdateDto {
  @IsOptional()
  @IsEmail()
  email: string;
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
  @IsOptional()
  firstName: string;
  @IsOptional()
  lastName: string;
  @IsOptional()
  phoneNumber: string;
  @IsOptional()
  birthDate: string;
  @IsOptional()
  username: string;
  @IsOptional()
  password: string;
}
