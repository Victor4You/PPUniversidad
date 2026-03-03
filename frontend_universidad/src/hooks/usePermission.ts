// src/hooks/usePermission.ts
// =============================================
// HOOK PARA MANEJAR PERMISOS Y ROLES
// =============================================

'use client';

import { useAuth } from './useAuth';
import { UserRole } from '@/lib/types/auth.types';

/**
 * Hook para manejar permisos basados en roles
 * 
 * @returns Funciones para verificar permisos y roles
 * 
 * @example
 * const { canView, isRole, hasAnyRole } = usePermission();
 * const canViewReports = canView(['admin', 'teacher']);
 */
export function usePermission() {
  const { user } = useAuth();

  /**
   * Verifica si el usuario tiene al menos uno de los roles especificados
   * 
   * @param allowedRoles - Array de roles permitidos
   * @returns boolean - True si el usuario tiene permiso
   */
  const canView = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  /**
   * Verifica si el usuario tiene un rol específico
   * 
   * @param role - Rol a verificar
   * @returns boolean - True si el usuario tiene ese rol
   */
  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * 
   * @param roles - Array de roles a verificar
   * @returns boolean - True si el usuario tiene alguno de los roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    canView,
    isRole,
    hasAnyRole,
    userRole: user?.role,
  };
}