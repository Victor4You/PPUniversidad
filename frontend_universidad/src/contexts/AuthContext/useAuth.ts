// src/contexts/AuthContext/useAuth.ts
// =============================================
// HOOK PERSONALIZADO PARA USAR EL CONTEXTO DE AUTENTICACIÓN
// =============================================

'use client';

import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * 
 * @returns Contexto de autenticación con estado y funciones
 * @throws Error si se usa fuera de un AuthProvider
 * 
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}