export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
