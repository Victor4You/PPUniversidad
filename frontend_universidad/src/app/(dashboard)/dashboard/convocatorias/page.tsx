// src/app/(dashboard)/dashboard/convocatorias/page.tsx
'use client';

import { useState, useEffect } from 'react';
//  Imports de hooks
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';


interface Convocatoria {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'academica' | 'beca' | 'evento' | 'empleo';
  fechaInicio: string;
  fechaFin: string;
  estado: 'activa' | 'finalizada' | 'proximamente' | 'cancelada';
  destinatarios: string[];
  plazas: number;
  inscritos: number;
  ciudad: string;
  requisitos: string[];
  enlace?: string;
}

const convocatoriasMock: Convocatoria[] = [
  {
    id: '1',
    titulo: 'Convocatoria Beca Excelencia Académica 2024',
    descripcion: 'Beca para estudiantes con promedio mayor a 9.0 en el último semestre',
    tipo: 'beca',
    fechaInicio: '2024-02-01',
    fechaFin: '2024-03-15',
    estado: 'activa',
    destinatarios: ['Estudiantes de pregrado', 'Promedio mínimo 9.0'],
    plazas: 15,
    inscritos: 8,
    ciudad: 'Ciudad Universitaria',
    requisitos: ['Promedio mínimo 9.0', 'Sin materias reprobadas', 'Carta de motivos'],
    enlace: '/convocatorias/beca-excelencia'
  },
  {
    id: '2',
    titulo: 'Concurso de Investigación Científica',
    descripcion: 'Participa con tu proyecto de investigación y gana fondos para desarrollo',
    tipo: 'academica',
    fechaInicio: '2024-01-15',
    fechaFin: '2024-02-28',
    estado: 'activa',
    destinatarios: ['Estudiantes de posgrado', 'Investigadores'],
    plazas: 10,
    inscritos: 6,
    ciudad: 'Campus Central',
    requisitos: ['Proyecto de investigación', 'CV del investigador', 'Presupuesto detallado']
  },
  {
    id: '3',
    titulo: 'Intercambio Internacional 2024-II',
    descripcion: 'Programa de intercambio con universidades socias en el extranjero',
    tipo: 'academica',
    fechaInicio: '2024-03-01',
    fechaFin: '2024-04-30',
    estado: 'proximamente',
    destinatarios: ['Estudiantes de 5to semestre en adelante', 'Nivel de idiomas B2'],
    plazas: 25,
    inscritos: 0,
    ciudad: 'Varias sedes internacionales',
    requisitos: ['Promedio mínimo 8.5', 'Certificado de idiomas', 'Entrevista']
  },
  {
    id: '4',
    titulo: 'Taller de Emprendimiento Tecnológico',
    descripcion: 'Desarrolla habilidades emprendedoras en el sector tecnológico',
    tipo: 'evento',
    fechaInicio: '2024-01-20',
    fechaFin: '2024-01-25',
    estado: 'finalizada',
    destinatarios: ['Estudiantes de ingeniería', 'Emprendedores'],
    plazas: 30,
    inscritos: 30,
    ciudad: 'Aula Magna',
    requisitos: ['Inscripción previa', 'Asistencia mínima 80%']
  },
  {
    id: '5',
    titulo: 'Pasantías en Empresas Asociadas',
    descripcion: 'Programa de prácticas profesionales en empresas líderes del sector',
    tipo: 'empleo',
    fechaInicio: '2024-02-10',
    fechaFin: '2024-03-10',
    estado: 'activa',
    destinatarios: ['Estudiantes de últimos semestres', 'Egresados recientes'],
    plazas: 50,
    inscritos: 35,
    ciudad: 'Diversas empresas asociadas',
    requisitos: ['CV actualizado', 'Carta de presentación', 'Historial académico']
  },
  {
    id: '6',
    titulo: 'Programa de Tutorías Académicas',
    descripcion: 'Conviértete en tutor y ayuda a estudiantes de primeros semestres',
    tipo: 'academica',
    fechaInicio: '2024-01-10',
    fechaFin: '2024-01-31',
    estado: 'finalizada',
    destinatarios: ['Estudiantes de semestres avanzados', 'Promedio mínimo 8.0'],
    plazas: 20,
    inscritos: 20,
    ciudad: 'Biblioteca Central',
    requisitos: ['Promedio mínimo 8.0', 'Disponibilidad horaria', 'Entrevista']
  }
];

export default function ConvocatoriasPage() {
    const { user } = useAuth();
    const { canView, isRole } = usePermission();
  
    const canViewButon = canView (['admin', 'teacher']);
  
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [filteredConvocatorias, setFilteredConvocatorias] = useState<Convocatoria[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 4;

  // Filtros
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterCiudad, setFilterCiudad] = useState<string>('todos');

  const tiposUnicos = Array.from(new Set(convocatoriasMock.map(c => c.tipo)));
  const ciudadesUnicas = Array.from(new Set(convocatoriasMock.map(c => c.ciudad)));

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setConvocatorias(convocatoriasMock);
      setFilteredConvocatorias(convocatoriasMock);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = convocatorias;
    
    // Filtro por búsqueda
    if (search) {
      filtered = filtered.filter(convocatoria =>
        convocatoria.titulo.toLowerCase().includes(search.toLowerCase()) ||
        convocatoria.descripcion.toLowerCase().includes(search.toLowerCase()) ||
        convocatoria.ciudad.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filtro por estado
    if (filterEstado !== 'todos') {
      filtered = filtered.filter(convocatoria => convocatoria.estado === filterEstado);
    }
    
    // Filtro por tipo
    if (filterTipo !== 'todos') {
      filtered = filtered.filter(convocatoria => convocatoria.tipo === filterTipo);
    }
    
    // Filtro por ciudad
    if (filterCiudad !== 'todos') {
      filtered = filtered.filter(convocatoria => convocatoria.ciudad === filterCiudad);
    }
    
    setFilteredConvocatorias(filtered);
    setCurrentPage(1);
  }, [search, filterEstado, filterTipo, filterCiudad, convocatorias]);

  const totalPages = Math.ceil(filteredConvocatorias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentConvocatorias = filteredConvocatorias.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'academica': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'beca': return 'bg-green-100 text-green-800 border-green-200';
      case 'evento': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'empleo': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoText = (tipo: string) => {
    switch (tipo) {
      case 'academica': return 'Académica';
      case 'beca': return 'Beca';
      case 'evento': return 'Evento';
      case 'empleo': return 'Empleo';
      default: return 'Otro';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'bg-green-100 text-green-800 border-green-200';
      case 'finalizada': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'proximamente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'activa': return 'Activa';
      case 'finalizada': return 'Finalizada';
      case 'proximamente': return 'Próximamente';
      case 'cancelada': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const calcularDiasRestantes = (fechaFin: string) => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diffTime = fin.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando convocatorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de la página con título y descripción */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Convocatorias</h1>
        <p className="text-gray-600">Gestiona convocatorias académicas</p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="w-full lg:w-96">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar convocatorias por título, descripción o ciudad..."
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Filtro por estado */}
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activa">Activa</option>
              <option value="finalizada">Finalizada</option>
              <option value="proximamente">Próximamente</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          
          {/* Filtro por tipo */}
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
            >
              <option value="todos">Todos los tipos</option>
              <option value="academica">Académica</option>
              <option value="beca">Beca</option>
              <option value="evento">Evento</option>
              <option value="empleo">Empleo</option>
            </select>
          </div>
          
          {/* Filtro por ciudad */}
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterCiudad}
              onChange={(e) => setFilterCiudad(e.target.value)}
            >
              <option value="todos">Todas las ciudades</option>
              {ciudadesUnicas.map(ciudad => (
                <option key={ciudad} value={ciudad}>{ciudad}</option>
              ))}
            </select>
          </div>
          {canViewButon && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Convocatoria
          </button>
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Total Convocatorias</p>
              <p className="text-2xl font-bold text-blue-600">{convocatorias.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Activas</p>
              <p className="text-2xl font-bold text-green-600">
                {convocatorias.filter(c => c.estado === 'activa').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Total Inscritos</p>
              <p className="text-2xl font-bold text-purple-600">
                {convocatorias.reduce((sum, convocatoria) => sum + convocatoria.inscritos, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Ocupación Promedio</p>
              <p className="text-2xl font-bold text-amber-600">
                {Math.round(convocatorias.reduce((sum, convocatoria) => 
                  sum + (convocatoria.inscritos / convocatoria.plazas * 100), 0) / convocatorias.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cuadro de información del curso (como en el diseño) */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Convocatorias</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Convocatorias activas:</span>
                <span className="font-medium">{convocatorias.filter(c => c.estado === 'activa').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Próximas convocatorias:</span>
                <span className="font-medium">{convocatorias.filter(c => c.estado === 'proximamente').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Convocatorias finalizadas:</span>
                <span className="font-medium">{convocatorias.filter(c => c.estado === 'finalizada').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total de plazas disponibles:</span>
                <span className="font-medium">{convocatorias.reduce((sum, c) => sum + c.plazas, 0)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Tipo</h3>
            <div className="space-y-3">
              {['academica', 'beca', 'evento', 'empleo'].map(tipo => {
                const count = convocatorias.filter(c => c.tipo === tipo).length;
                const porcentaje = convocatorias.length > 0 ? Math.round((count / convocatorias.length) * 100) : 0;
                return (
                  <div key={tipo} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${getTipoColor(tipo).split(' ')[0]}`}></span>
                      <span className="text-gray-700">{getTipoText(tipo)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{count}</span>
                      <span className="text-gray-500 text-sm">({porcentaje}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de convocatorias */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Convocatorias Disponibles</h3>
        
        {currentConvocatorias.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-gray-500">No se encontraron convocatorias</p>
            <p className="text-sm text-gray-400">Intenta con otros términos de búsqueda o filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentConvocatorias.map((convocatoria) => {
              const diasRestantes = calcularDiasRestantes(convocatoria.fechaFin);
              const porcentajeInscripcion = Math.round((convocatoria.inscritos / convocatoria.plazas) * 100);
              
              return (
                <div key={convocatoria.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Header de la convocatoria */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{convocatoria.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1">{convocatoria.descripcion}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTipoColor(convocatoria.tipo)}`}>
                          {getTipoText(convocatoria.tipo)}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getEstadoColor(convocatoria.estado)}`}>
                          {getEstadoText(convocatoria.estado)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Información de fechas */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Fecha de inicio</p>
                        <p className="text-sm font-medium text-gray-900">{formatFecha(convocatoria.fechaInicio)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fecha de cierre</p>
                        <p className="text-sm font-medium text-gray-900">{formatFecha(convocatoria.fechaFin)}</p>
                      </div>
                    </div>
                    
                    {/* Barra de progreso de inscripciones */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Inscripciones: {convocatoria.inscritos}/{convocatoria.plazas}</span>
                        <span className="text-gray-500">{porcentajeInscripcion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            porcentajeInscripcion >= 90 ? 'bg-red-600' :
                            porcentajeInscripcion >= 70 ? 'bg-yellow-600' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(porcentajeInscripcion, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Ciudad e información adicional */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Ciudad:</span> {convocatoria.ciudad}
                          </p>
                          {diasRestantes > 0 && convocatoria.estado === 'activa' && (
                            <p className="text-sm text-blue-600 mt-1">
                              <span className="font-medium">{diasRestantes}</span> días restantes para aplicar
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Plazas disponibles:</span> {convocatoria.plazas - convocatoria.inscritos}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Destinatarios y requisitos */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Destinatarios:</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {convocatoria.destinatarios.map((destinatario, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {destinatario}
                          </span>
                        ))}
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900 mb-2">Requisitos principales:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {convocatoria.requisitos.slice(0, 3).map((requisito, index) => (
                          <li key={index} className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {requisito}
                          </li>
                        ))}
                        {convocatoria.requisitos.length > 3 && (
                          <li className="text-blue-600 text-sm">
                            + {convocatoria.requisitos.length - 3} requisitos más...
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Acciones */}
                  <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Aplicar
                        </button>
                        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredConvocatorias.length)}
              </span>{' '}
              de <span className="font-medium">{filteredConvocatorias.length}</span> convocatorias
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}