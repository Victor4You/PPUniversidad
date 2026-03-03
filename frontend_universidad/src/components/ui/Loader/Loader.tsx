// src/components/ui/Loader/Loader.tsx
// =============================================
// COMPONENTE LOADER (SPINNER) REUTILIZABLE
// =============================================

'use client';

import React from 'react';

/**
 * Props para el componente Loader
 */
interface LoaderProps {
  /** Tamaño del loader */
  size?: 'sm' | 'md' | 'lg';
  /** Color del loader */
  color?: 'blue' | 'gray' | 'white';
  /** Texto a mostrar debajo del loader */
  text?: string;
  /** Indica si mostrar el loader en pantalla completa */
  fullScreen?: boolean;
}

/**
 * Componente Loader para indicar carga
 * 
 * @component
 * @example
 * <Loader size="md" color="blue" text="Cargando..." />
 */
export function Loader({
  size = 'md',
  color = 'blue',
  text,
  fullScreen = false,
}: LoaderProps) {
  // =============================================
  // CONFIGURACIÓN DE TAMAÑOS
  // =============================================
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  // =============================================
  // CONFIGURACIÓN DE COLORES
  // =============================================
  const colorClasses = {
    blue: 'border-blue-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  // =============================================
  // RENDERIZADO
  // =============================================
  const loaderContent = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Cargando"
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
}