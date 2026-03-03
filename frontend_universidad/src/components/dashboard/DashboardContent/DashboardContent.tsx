// src/components/dashboard/DashboardContent/DashboardContent.tsx
// =============================================
// CONTENIDO PRINCIPAL DEL DASHBOARD
// =============================================

'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';

/**
 * Componente que renderiza el contenido principal del dashboard
 * basado en el rol del usuario
 * 
 * @component
 */
export function  DashboardContent() {
  const { user } = useAuth();
  const { canView, isRole } = usePermission();

  // =============================================
  // VERIFICACIÓN DE PERMISOS
  // =============================================
  const canViewReports = canView(['admin', 'teacher']);
  const canViewQuickActions = canView(['admin', 'teacher']);
  const canViewGeneralView = canView(['admin', 'teacher']);

  // =============================================
  // RENDERIZADO
  // =============================================
  return (
    <>
      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:flex-row">
        {/* Widget: Estadísticas Generales */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Estadísticas Generales
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total de Cursos</span>
              <span className="font-semibold text-blue-600">24</span>
            </div>
            
            {/* Estudiantes Activos - Solo Admin y Teachers */}
            {canViewReports && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100 ">
                <span className="text-gray-600">Estudiantes Activos</span>
                <span className="font-semibold text-green-600">156</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Evaluaciones Pendientes</span>
              <span className="font-semibold text-yellow-600">8</span>
            </div>
          </div>
        </div>

        {/* Widget: Actividad Reciente */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            <div className="text-sm p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-800">Nuevo curso creado</p>
              <p className="text-blue-600 text-xs mt-1">Hace 2 horas</p>
            </div>
            <div className="text-sm p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-800">Evaluación completada</p>
              <p className="text-green-600 text-xs mt-1">Hace 5 horas</p>
            </div>
            <div className="text-sm p-3 bg-yellow-50 rounded-lg">
              <p className="font-medium text-yellow-800">Tarea asignada</p>
              <p className="text-yellow-600 text-xs mt-1">Hace 1 día</p>
            </div>
          </div>
        </div>

        {/* Widget: Acciones Rápidas - Solo Admin y Teachers */}
        {canViewQuickActions && (
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Acciones Rápidas
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300">
                <span className="font-medium">Crear nueva evaluación</span>
              </button>
              <button className="w-full text-left py-3 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-300">
                <span className="font-medium">Gestionar cursos</span>
              </button>
              <button className="w-full text-left py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300">
                <span className="font-medium">Ver reportes</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vista General - Solo Admin y Teachers */}
      {canViewGeneralView && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vista General</h3>
          <p className="text-gray-600 mb-6">
            Selecciona una opción del menú lateral para comenzar a gestionar tu plataforma educativa.
          </p>
          
          {isRole('admin') && (
            <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Privilegios de Administrador
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Acceso completo a todos los módulos
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Gestión de reportes y estadísticas
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Control total del sistema
                </li>
              </ul>
            </div>
          )}

          {isRole('teacher') && (
            <div className="p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                Privilegios de Profesor
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Gestión de cursos y evaluaciones
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Acceso a reportes académicos
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Control de contenido educativo
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Mensaje especial para estudiantes */}
      {isRole('student') && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Vista Estudiante
          </h3>
          <p className="text-gray-600 mb-6">
            Como estudiante, tienes acceso limitado a las funcionalidades del dashboard. 
            Puedes ver información general de tus cursos y actividades recientes.
          </p>
          <div className="p-4 bg-linear-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-100">
            <h4 className="font-semibold text-yellow-800 mb-2">Tu acceso incluye:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Visualización de cursos inscritos
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Consulta de evaluaciones pendientes
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Revisión de actividades recientes
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Configuración de perfil personal
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}