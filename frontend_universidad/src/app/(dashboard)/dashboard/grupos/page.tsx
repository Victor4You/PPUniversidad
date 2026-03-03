'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GrupoForm } from "@/components/Forms/GrupoForm";

interface Estudiante {
  id: string;
  nombre: string;
  matricula: string;
  email: string;
  telefono: string;
  estado: 'activo' | 'inactivo';
}

interface Grupo {
  id: string;
  nombre: string;
  curso: string;
  codigo: string;
  instructor: string;
  estudiantes: number;
  estado: 'activo' | 'inactivo';
  capacidad: number;
  estudiantesLista: Estudiante[];
}

// Datos de ejemplo extendidos para probar la paginación de la tabla
const estudiantesMock: Estudiante[] = [
  { id: '1', nombre: 'Juan Pérez', matricula: '20230001', email: 'juan.perez@edu.com', telefono: '+51 999', estado: 'activo' },
  { id: '2', nombre: 'María López', matricula: '20230002', email: 'maria.lopez@edu.com', telefono: '+51 998', estado: 'activo' },
  { id: '3', nombre: 'Carlos Sánchez', matricula: '20230003', email: 'carlos.sanchez@edu.com', telefono: '+51 997', estado: 'activo' },
  { id: '4', nombre: 'Ana Rodríguez', matricula: '20230004', email: 'ana.rodriguez@edu.com', telefono: '+51 996', estado: 'inactivo' },
  { id: '5', nombre: 'Luis Garcia', matricula: '20230005', email: 'luis.garcia@edu.com', telefono: '+51 995', estado: 'activo' },
];

const gruposMock: Grupo[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `${i + 1}`,
  nombre: `Grupo ${String.fromCharCode(65 + i)} - ${i % 2 === 0 ? 'Matemáticas' : 'Programación'}`,
  curso: i % 2 === 0 ? 'Matemáticas' : 'Programación',
  codigo: `GRP-00${i + 1}`,
  instructor: 'Carlos Mendoza',
  estudiantes: 5,
  capacidad: 30,
  estado: i % 3 === 0 ? 'inactivo' : 'activo',
  estudiantesLista: estudiantesMock
}));

export default function GruposPage() {
  const { userRole } = usePermission();
  const canEdit = userRole === 'admin' || userRole === 'teacher';

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  
  // PAGINACIÓN TABLA PRINCIPAL (GRUPOS)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Grupos por página

  // PAGINACIÓN INTERNA (ESTUDIANTES)
  const [studentPages, setStudentPages] = useState<Record<string, number>>({});
  const studentsPerPage = 3;

  const [showGrupoForm, setShowGrupoForm] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState<{ open: boolean; type: 'grupo' | 'estudiante'; data: any }>({
    open: false, type: 'grupo', data: null
  });
  const [nuevoEstado, setNuevoEstado] = useState<string>('');

  useEffect(() => {
    setTimeout(() => {
      setGrupos(gruposMock);
      setIsLoading(false);
    }, 800);
  }, []);

  // Lógica de filtrado y paginación de grupos
  const filteredGrupos = useMemo(() => {
    return grupos.filter(g =>
      g.nombre.toLowerCase().includes(search.toLowerCase()) ||
      g.codigo.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, grupos]);

  const totalPages = Math.ceil(filteredGrupos.length / itemsPerPage);
  const currentGrupos = filteredGrupos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleRow = (grupoId: string) => {
    setExpandedRows(prev => prev.includes(grupoId) ? prev.filter(id => id !== grupoId) : [...prev, grupoId]);
    if (!studentPages[grupoId]) setStudentPages(prev => ({ ...prev, [grupoId]: 1 }));
  };

  const manejarCambioEstado = () => {
    if (!showEstadoModal.data) return;
    if (showEstadoModal.type === 'grupo') {
      setGrupos(prev => prev.map(g => g.id === showEstadoModal.data.id ? { ...g, estado: nuevoEstado as any } : g));
    } else {
      const { grupoId, estudianteId } = showEstadoModal.data;
      setGrupos(prev => prev.map(g => g.id === grupoId ? {
        ...g, estudiantesLista: g.estudiantesLista.map(e => e.id === estudianteId ? { ...e, estado: nuevoEstado as any } : e)
      } : g));
    }
    setShowEstadoModal({ open: false, type: 'grupo', data: null });
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse text-gray-500 font-medium">Cargando grupos...</div>;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Grupos</h1>
          <p className="text-sm text-gray-600">Administra tus clases y estudiantes matriculados</p>
        </div>
        {canEdit && (
          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 shadow-md" onClick={() => setShowGrupoForm(true)}>
            + Nuevo Grupo
          </Button>
        )}
      </div>

      <div className="relative w-full max-w-md">
        <Input 
          className="pl-4 shadow-sm" 
          placeholder="Buscar por nombre o código..." 
          value={search} 
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Grupo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Curso</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiantes</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentGrupos.length > 0 ? (
                currentGrupos.map((grupo) => (
                  <React.Fragment key={grupo.id}>
                    <tr className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => toggleRow(grupo.id)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`mr-3 text-blue-600 transition-transform duration-200 ${expandedRows.includes(grupo.id) ? 'rotate-180' : ''}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                          </span>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{grupo.nombre}</div>
                            <div className="text-[11px] text-gray-400 font-mono">{grupo.codigo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{grupo.curso}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-semibold">{grupo.estudiantes}/{grupo.capacidad}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowEstadoModal({ open: true, type: 'grupo', data: grupo }); setNuevoEstado(grupo.estado); }}
                          className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all hover:scale-105 ${
                            grupo.estado === 'activo' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                          }`}
                        >
                          {grupo.estado.toUpperCase()} ✎
                        </button>
                      </td>
                    </tr>
                    {expandedRows.includes(grupo.id) && (
                      <tr className="bg-gray-50/80">
                        <td colSpan={4} className="px-8 py-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Lista de Estudiantes</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                            {grupo.estudiantesLista
                              .slice(((studentPages[grupo.id] || 1) - 1) * studentsPerPage, (studentPages[grupo.id] || 1) * studentsPerPage)
                              .map(est => (
                                <div key={est.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                      {est.nombre.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold text-gray-800">{est.nombre}</div>
                                      <div className="text-[10px] text-gray-500 font-mono">{est.matricula}</div>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => { setShowEstadoModal({ open: true, type: 'estudiante', data: { grupoId: grupo.id, estudianteId: est.id } }); setNuevoEstado(est.estado); }}
                                    className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${est.estado === 'activo' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}
                                  >
                                    {est.estado.toUpperCase()}
                                  </button>
                                </div>
                              ))}
                          </div>
                          
                          {/* Mini-Paginación Estudiantes */}
                          <div className="flex justify-center items-center gap-2">
                            {Array.from({ length: Math.ceil(grupo.estudiantesLista.length / studentsPerPage) }).map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setStudentPages(prev => ({ ...prev, [grupo.id]: idx + 1 }))}
                                className={`w-6 h-6 flex items-center justify-center text-[10px] rounded-md border font-bold transition-all ${
                                  studentPages[grupo.id] === idx + 1 ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-400 hover:bg-gray-100'
                                }`}
                              >
                                {idx + 1}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">No se encontraron grupos con esos criterios.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

{/* CONTROLES DE PAGINACIÓN TABLA DE GRUPOS - CORREGIDO */}
<div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
  <div className="text-sm text-gray-500 font-medium">
    Mostrando <span className="text-gray-900 font-bold">{currentGrupos.length}</span> de <span className="text-gray-900 font-bold">{filteredGrupos.length}</span> grupos
  </div>
  
  <div className="flex items-center gap-4">
    <span className="text-xs text-gray-500 font-bold">Página {currentPage} de {totalPages}</span>
    
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className={`h-9 w-9 p-0 border-gray-300 hover:bg-gray-100 flex items-center justify-center ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'text-blue-600'}`}
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
        disabled={currentPage === 1}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        className={`h-9 w-9 p-0 border-gray-300 hover:bg-gray-100 flex items-center justify-center ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'text-blue-600'}`}
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
        disabled={currentPage === totalPages}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  </div>
</div>
      </div>

      {showGrupoForm && <GrupoForm onClose={() => setShowGrupoForm(false)} />}

      {/* MODAL PARA CAMBIO DE ESTADO (GRUPOS Y ALUMNOS) */}
      {showEstadoModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xs transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-4">
              <h3 className="text-lg font-extrabold text-gray-900">Actualizar Estado</h3>
              <p className="text-xs text-gray-400 font-medium">Cambia la disponibilidad del registro</p>
            </div>
            <select 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none mb-6 text-gray-700"
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
            >
              <option value="activo">ACTIVO</option>
              <option value="inactivo">INACTIVO</option>
            </select>
            <div className="flex flex-col gap-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-5 rounded-xl" onClick={manejarCambioEstado}>Confirmar</Button>
              <Button variant="ghost" className="w-full text-gray-400 font-bold" onClick={() => setShowEstadoModal({ open: false, type: 'grupo', data: null })}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}