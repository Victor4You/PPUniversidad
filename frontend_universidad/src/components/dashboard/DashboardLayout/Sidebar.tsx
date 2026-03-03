// src/components/dashboard/DashboardLayout/Sidebar.tsx
// =============================================
// BARRA LATERAL DEL DASHBOARD (ACTUALIZADO RESPONSIVO)
// =============================================

'use client';

import React, { useState, useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { UserDropdown } from '@/components/auth/UserDropdown/UserDropdown';
import Link from 'next/link'; 
import { usePathname, useRouter } from 'next/navigation';

/**
 * Props para el componente Sidebar
 */
interface SidebarProps {
  /** Función para cambiar el menú abierto */
  onMenuToggle: (menuName: string | null) => void;
  /** Menú actualmente abierto */
  openMenu: string | null;
}

/**
 * Componente Sidebar para el dashboard
 * Muestra navegación basada en roles y permisos
 * 
 * @component
 */
export function Sidebar({ onMenuToggle, openMenu }: SidebarProps) {
  const { user } = useAuth();
  const { canView } = usePermission();
  const pathname = usePathname();
  const router = useRouter();

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================
  const handleMenuClick = (menuName: string) => {
    onMenuToggle(openMenu === menuName ? null : menuName);
  };

  const isMenuOpen = (menuName: string) => {
    return openMenu === menuName || (openMenu && openMenu.startsWith(`${menuName}.`));
  };

  const isActive = (route: string) => {
    return pathname === route || pathname?.startsWith(route + '/');
  };

  // Cerrar sidebar en móvil al navegar
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Solo cerrar en móvil
    if (window.innerWidth < 1024) {
      e.preventDefault();
      router.push(href);
      // El sidebar se cerrará por el efecto en DashboardLayout
    }
  };

  // =============================================
  // RENDERIZADO
  // =============================================
  return (
     <aside className="h-full w-64 bg-gray-800 text-white flex flex-col overflow-y-auto">
      {/* Encabezado del Sidebar */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-700">
        <Avatar 
          src={user?.avatar || null} 
          alt={user?.name || 'Usuario'} 
          size="md"
          fallbackLetter={user?.name?.charAt(0) || 'U'}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg lg:text-xl font-semibold truncate">Dashboard</h2>
          <p className="text-xs lg:text-sm text-gray-400 capitalize truncate">{user?.role}</p>
        </div>
      </div>
      
      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Inicio - Accesible para todos */}
        <Link 
          href="/dashboard"
          onClick={(e) => handleNavigation(e, '/dashboard')}
          className={`flex items-center py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isActive('/dashboard') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
          }`}
        >
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="truncate">Inicio</span>
        </Link>
        <Link 
                href="/dashboard/gestion-cursos" 
                onClick={(e) => handleNavigation(e, '/dashboard/gestion-cursos')}
                className={`flex items-center py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isActive('/dashboard/gestion-cursos') 
                    ? 'text-blue-300 font-medium' 
                    : 'hover:text-blue-300'
                }`}
              >
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
             <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0- 5.25 1.533v16.103Z"/>
          </svg>
          <span className="truncate">Gestión de cursos</span>
              </Link>

        {/* Administración - Con submenús */}
        <div>
          <button
            onClick={() => handleMenuClick('administracion')}
            className={`w-full flex items-center justify-between py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isMenuOpen('administracion') ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
            aria-expanded={isMenuOpen('administracion') ? "true" : "false"}
            aria-controls="administracion-submenu"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span className="truncate">Administración</span>
            </div>
            <span className="text-xs transform transition-transform duration-200 flex-shrink-0">
              {isMenuOpen('administracion') ? '▲' : '▼'}
            </span>
          </button>
          
          {isMenuOpen('administracion') && (
            <div 
              id="administracion-submenu"
              className="ml-8 lg:ml-10 mt-1 space-y-1 border-l border-gray-600 pl-3 lg:pl-4"
              role="region"
              aria-label="Submenú de Administración"
            >
              <Link 
                href="/dashboard/instructores" 
                onClick={(e) => handleNavigation(e, '/dashboard/instructores')}
                className={`block py-2 text-sm transition-colors truncate ${
                  isActive('/dashboard/instructores') 
                    ? 'text-blue-300 font-medium' 
                    : 'hover:text-blue-300'
                }`}
              >
                Instructores
              </Link>
              <Link 
                href="/dashboard/grupos" 
                onClick={(e) => handleNavigation(e, '/dashboard/grupos')}
                className={`block py-2 text-sm transition-colors truncate ${
                  isActive('/dashboard/grupos') 
                    ? 'text-blue-300 font-medium' 
                    : 'hover:text-blue-300'
                }`}
              >
                Grupos
              </Link>
              <Link 
                href="/dashboard/convocatorias" 
                onClick={(e) => handleNavigation(e, '/dashboard/convocatorias')}
                className={`block py-2 text-sm transition-colors truncate ${
                  isActive('/dashboard/convocatorias') 
                    ? 'text-blue-300 font-medium' 
                    : 'hover:text-blue-300'
                }`}
              >
                Convocatorias
              </Link>
              
              {/* Submenú Reportes - Solo Admin y Teachers */}
              {canView(['admin', 'teacher']) && (
                <div>
                  <button 
                    onClick={() => handleMenuClick('administracion.reportes')}
                    className={`w-full flex items-center justify-between py-2 text-sm transition-colors focus:text-blue-300 focus:outline-none truncate ${
                      isActive('/dashboard/reportes') ? 'text-blue-300' : 'hover:text-blue-300'
                    }`}
                    aria-expanded={isMenuOpen('administracion.reportes') ? "true" : "false"}
                  >
                    <span>Reportes</span>
                    <span className="text-xs flex-shrink-0">
                      {isMenuOpen('administracion.reportes') ? '▲' : '▼'}
                    </span>
                  </button>
                  
                  {isMenuOpen('administracion.reportes') && (
                    <div className="ml-3 lg:ml-4 mt-1 space-y-1 border-l border-gray-600 pl-3 lg:pl-4">
                      <Link 
                        href="/dashboard/reportes/generacion-indicadores"
                        onClick={(e) => handleNavigation(e, '/dashboard/reportes/generacion-indicadores')}
                        className={`block py-2 text-xs transition-colors truncate ${
                          isActive('/dashboard/reportes/generacion-indicadores') 
                            ? 'text-blue-200' 
                            : 'hover:text-blue-200'
                        }`}
                      >
                        Generación de indicadores
                      </Link>
                      <Link 
                        href="/dashboard/reportes/aniversarios"
                        onClick={(e) => handleNavigation(e, '/dashboard/reportes/aniversarios')}
                        className={`block py-2 text-xs transition-colors truncate ${
                          isActive('/dashboard/reportes/aniversarios') 
                            ? 'text-blue-200' 
                            : 'hover:text-blue-200'
                        }`}
                      >
                        Aniversarios
                      </Link>
                      <Link 
                        href="/dashboard/reportes/exportacion-datos"
                        onClick={(e) => handleNavigation(e, '/dashboard/reportes/exportacion-datos')}
                        className={`block py-2 text-xs transition-colors truncate ${
                          isActive('/dashboard/reportes/exportacion-datos') 
                            ? 'text-blue-200' 
                            : 'hover:text-blue-200'
                        }`}
                      >
                        Exportación de datos
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Separador y enlace para volver al Feed */}
        <div className="mt-8 pt-4 border-t border-gray-600">
          <Link 
            href="/" 
            onClick={(e) => handleNavigation(e, '/')}
            className="flex items-center py-3 px-4 rounded-md hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="truncate">Volver al Feed</span>
          </Link>
        </div>
      </nav>

      {/* UserDropdown en el footer del sidebar */}
      <div className="p-4 border-t border-gray-700">
        <UserDropdown />
      </div>
    </aside>
  );
}