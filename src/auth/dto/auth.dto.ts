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
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsNotEmpty()
  @IsString()
  firstName: string;
  @IsNotEmpty()
  @IsString()
  lastName: string;
  @IsNotEmpty()
  @IsString()
  phoneNumber: string
}

export class AdminDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}

export interface Payload {
  sub:         number;
  email:       string;
  firstName:   string;
  lastName:    string;
  role:        string;
  phoneNumber: string;
  createdAt:   Date;
  updatedAt:   Date;
  iat:         number;
  exp:         number;
}

export interface AccessToken {
  accessToken: string;
}

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  address: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
