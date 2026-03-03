// src/contexts/AuthContext/AuthContext.tsx
// =============================================
// CONTEXTO DE AUTENTICACIÓN (CREACIÓN DEL CONTEXTO)
// =============================================

'use client';

import { createContext } from 'react';
import { AuthContextType } from '@/lib/types/auth.types';

/**
 * Contexto de autenticación de React
 * Proporciona acceso global al estado de autenticación
 * y funciones relacionadas
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);