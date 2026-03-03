// src/components/ui/Avatar/Avatar.types.ts
// =============================================
// TIPOS PARA EL COMPONENTE AVATAR
// =============================================

/**
 * Props para el componente Avatar
 */
export interface AvatarProps {
  /** URL de la imagen del avatar */
  src: string | null;
  /** Texto alternativo para accesibilidad */
  alt: string;
  /** Tamaño del avatar en clases de Tailwind */
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
  /** Clases CSS adicionales */
  className?: string;
  /** Indica si el avatar tiene borde */
  bordered?: boolean;
  /** Letra a mostrar si no hay imagen (primera letra del nombre) */
  fallbackLetter?: string;
}