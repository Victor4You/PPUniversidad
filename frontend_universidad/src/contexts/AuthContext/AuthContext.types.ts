// src/contexts/AuthContext/AuthContext.types.ts
// =============================================
// TIPOS ESPECÍFICOS PARA EL CONTEXTO DE AUTENTICACIÓN
// =============================================

import { AuthContextType, User, LoginCredentials } from '@/lib/types/auth.types';

/**
 * Props para el proveedor del contexto de autenticación
 */
export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Configuración del contexto de autenticación
 */
export interface AuthConfig {
  storageKey: string;
  tokenKey: string;
  userKey: string;
}