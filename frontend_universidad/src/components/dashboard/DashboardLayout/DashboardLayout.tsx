// src/components/dashboard/DashboardLayout/DashboardLayout.tsx
// =============================================
// LAYOUT PRINCIPAL DEL DASHBOARD (ACTUALIZADO RESPONSIVO)
// =============================================

'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Loader } from '@/components/ui/Loader/Loader';

/**
 * Props para el componente DashboardLayout
 */
interface DashboardLayoutProps {
  /** Contenido principal del dashboard */
  children: React.ReactNode;
  /** Título de la página */
  title?: string;
  /** Descripción de la página */
  description?: string;
}

/**
 * Layout principal para todas las páginas del dashboard
 * Incluye sidebar y área de contenido principal
 * 
 * @component
 * @example
 * <DashboardLayout title="Dashboard" description="Bienvenido al panel">
 *   <div>Contenido...</div>
 * </DashboardLayout>
 */
export function DashboardLayout({
  children,
  title = 'Dashboard',
  description = 'Gestiona tu plataforma educativa',
}: DashboardLayoutProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // =============================================
  // DETECTAR DISPOSITIVO MÓVIL
  // =============================================
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // =============================================
  // MANEJADORES
  // =============================================
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Cerrar sidebar cuando se redimensiona a desktop
  useEffect(() => {
    if (!isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  // =============================================
  // RENDERIZADO
  // =============================================
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Overlay para móviles (oscurece el fondo cuando sidebar está abierto) */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - POSICIÓN CORREGIDA */}
      <aside className={`
        ${isMobile ? 'fixed' : 'sticky top-0 h-screen'}
        inset-y-0 left-0 
        z-40 w-64 
        transition-transform duration-300 ease-in-out
        ${sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
        ${!isMobile ? 'flex-shrink-0' : ''}
      `}>
        <Sidebar
          openMenu={openMenu}
          onMenuToggle={setOpenMenu}
        />
      </aside>

      {/* Área de contenido principal - POSICIÓN CORREGIDA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header móvil con botón hamburguesa */}
        {isMobile && (
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm lg:hidden">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={sidebarOpen}
              >
                {/* Icono hamburguesa */}
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {sidebarOpen ? (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  ) : (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 6h16M4 12h16M4 18h16" 
                    />
                  )}
                </svg>
              </button>
              
              <div className="flex-1 text-center">
                <h1 className="text-lg font-semibold text-gray-800 truncate">{title}</h1>
              </div>
              
              <div className="w-10"></div> {/* Spacer para alinear */}
            </div>
          </header>
        )}

        {/* Contenido principal */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Encabezado del contenido (solo en desktop) */}
          {!isMobile && (
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                {title}
              </h1>
              {description && (
                <p className="text-gray-600 mt-2">{description}</p>
              )}
            </header>
          )}
          
          {/* Contenido */}
          <div className="space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}