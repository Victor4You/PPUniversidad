// src/lib/utils/validation.utils.ts
// =============================================
// UTILIDADES DE VALIDACIÓN
// =============================================

/**
 * Valida si un email tiene formato válido
 * 
 * @param email - Email a validar
 * @returns boolean - True si el email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida si una contraseña cumple con los requisitos mínimos
 * 
 * @param password - Contraseña a validar
 * @returns Objeto con validez y mensaje de error
 */
export function validatePassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'La contraseña debe tener al menos 8 caracteres',
    };
  }

  // Requisitos de seguridad básicos
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return {
      isValid: false,
      message: 'La contraseña debe contener mayúsculas, minúsculas y números',
    };
  }

  return { isValid: true };
}

/**
 * Sanitiza una cadena de texto para prevenir XSS
 * 
 * @param input - Texto a sanitizar
 * @returns Texto sanitizado
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valida si un string es una URL válida
 * 
 * @param url - URL a validar
 * @returns boolean - True si la URL es válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}