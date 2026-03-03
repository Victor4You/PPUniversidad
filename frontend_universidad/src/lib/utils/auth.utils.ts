// src/lib/utils/auth.utils.ts
import { User } from '../types/auth.types';

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
} as const;

export const getStoredAuthData = (): { user: User | null; token: string | null } => {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    const user = userData ? JSON.parse(userData) : null;
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
};

export const setAuthData = (user: User, token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  // Un JWT real se divide en 3 partes por puntos
  return token.split('.').length === 3;
};