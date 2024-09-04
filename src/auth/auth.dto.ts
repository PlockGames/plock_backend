import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class AuthSignupDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  @IsString()
  email: string;
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  username: string;
}

export class AdminDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}
