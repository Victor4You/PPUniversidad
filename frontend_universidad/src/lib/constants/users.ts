// src/lib/constants/users.ts
// =============================================
// DATOS MOCK DE USUARIOS PARA DEMOSTRACIÓN
// =============================================

import { User } from '../types/auth.types';

/**
 * Usuarios de demostración para pruebas
 * Contraseña para todos: password123
 */
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin Universidad',
    email: 'admin@universidad.edu',
    role: 'admin',
    avatar: null,
    department: 'Administración',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Profesor Carlos Mendoza',
    email: 'profesor@universidad.edu',
    role: 'teacher',
    avatar: null,
    department: 'Matemáticas',
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'Ana García',
    email: 'ana@universidad.edu',
    role: 'teacher',
    avatar: null,
    department: 'Ciencias',
    createdAt: '2024-01-01',
  },
  {
    id: '4',
    name: 'Estudiante Ejemplo',
    email: 'estudiante@universidad.edu',
    role: 'student',
    avatar: null,
    department: 'Ingeniería',
    createdAt: '2024-01-01',
  },
  {
    id: '5',
    name: 'Usuario General',
    email: 'usuario@universidad.edu',
    role: 'user',
    avatar: null,
    department: 'General',
    createdAt: '2024-01-01',
  },
];