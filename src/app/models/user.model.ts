export interface User {
  id?: string;
  email: string;
  password?: string;
  name: string;
  role: 'admin' | 'editor';
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
  expiresIn: number;
}
