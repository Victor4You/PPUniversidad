// src/lib/types/auth.types.ts
export type UserRole = 'admin' | 'teacher' | 'student' | 'user';

export interface User {
  id: string;
  username: string; 
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  department?: string;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: UserRole;
  [key: string]: any; // Permite campos adicionales que vengan de la API
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}