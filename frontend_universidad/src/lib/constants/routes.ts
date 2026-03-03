// src/lib/constants/routes.ts
// =============================================
// CONSTANTES DE RUTAS DE LA APLICACIÓN
// =============================================

/**
 * Rutas públicas de la aplicación
 * Accesibles sin autenticación
 */
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
} as const;

/**
 * Rutas protegidas de la aplicación
 * Requieren autenticación
 */
export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  POSTS: '/posts',
} as const;

/**
 * Todas las rutas de la aplicación
 */
export const APP_ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
} as const;

/**
 * Tipo para las claves de rutas
 */
export type RouteKey = keyof typeof APP_ROUTES;