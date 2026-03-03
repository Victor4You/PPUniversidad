'use client';

import React, { useState } from 'react';
import ExperienceTable from '@/components/ExperienceTable';
import { UserProfile } from '@/lib/types/user.types';
import { exportToCSV } from '@/lib/utils';
import { Calendar, FileDown, FileSpreadsheet, Search } from 'lucide-react';

type Periodo = 'dia' | 'semana' | 'mes' | 'año';

export default function AniversariosPage() {
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [valorFiltro, setValorFiltro] = useState('');
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<UserProfile[]>([]);
  const [cargando, setCargando] = useState(false);

  const mockUsers: UserProfile[] = [
    { id: '1', name: 'Carlos Pérez', department: 'Director de Arte', role: 'admin' , email: 'c@p.com', avatar: null, createdAt: '2020-01-15' },
    { id: '2', name: 'Ana Gómez', department: 'Software Engineer', role: 'admin' , email: 'a@g.com', avatar: null, createdAt: '2022-06-10' },
  ];

  const manejarGenerar = () => {
    if (!valorFiltro) return alert("Selecciona un valor para filtrar");
    setCargando(true);
    setTimeout(() => {
      setUsuariosFiltrados(mockUsers);
      setCargando(false);
    }, 600);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100 mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 mb-6 md:mb-8 uppercase tracking-tight flex items-center gap-3">
          <div className="w-1.5 h-6 md:w-2 md:h-8 bg-blue-600 rounded-full"></div>
          Reporte de Aniversarios
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Selector de Tipo de Periodo - Ocupa 5 columnas en desktop */}
          <div className="flex flex-col gap-3 lg:col-span-5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Filtro por Periodo
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl md:rounded-2xl overflow-x-auto no-scrollbar">
              {(['dia', 'semana', 'mes', 'año'] as Periodo[]).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPeriodo(p); setValorFiltro(''); }}
                  className={`flex-1 min-w-[70px] px-3 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all uppercase ${
                    periodo === p 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Input Dinámico - Ocupa 4 columnas en desktop */}
          <div className="flex flex-col gap-3 lg:col-span-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Seleccionar {periodo}
            </label>
            <input 
              type={periodo === 'dia' ? 'date' : periodo === 'mes' ? 'month' : periodo === 'semana' ? 'week' : 'number'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl px-4 py-2.5 md:py-3 text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
              value={valorFiltro}
              onChange={(e) => setValorFiltro(e.target.value)}
            />
          </div>

          {/* Botón Generar - Ocupa 3 columnas en desktop */}
          <button 
            onClick={manejarGenerar}
            disabled={cargando}
            className="w-full lg:col-span-3 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl md:rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest shadow-lg shadow-slate-200"
          >
            {cargando ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : <Search size={16} />}
            Generar Reporte
          </button>
        </div>
      </div>

      {usuariosFiltrados.length > 0 ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Resultados: {usuariosFiltrados.length} empleados
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => window.print()}
                className="flex-1 sm:flex-none justify-center bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50 shadow-sm"
              >
                <FileDown size={14} className="text-red-500" />
                PDF
              </button>
              <button 
                onClick={() => exportToCSV(usuariosFiltrados, 'reporte.csv')}
                className="flex-1 sm:flex-none justify-center bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50 shadow-sm"
              >
                <FileSpreadsheet size={14} className="text-green-500" />
                CSV
              </button>
            </div>
          </div>
          
          <ExperienceTable users={usuariosFiltrados} />
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[24px] md:rounded-[40px] py-16 md:py-32 flex flex-col items-center justify-center text-center px-4">
          <Calendar className="text-slate-200 mb-4" size={48} />
          <h3 className="text-lg font-black text-slate-400 uppercase tracking-tighter">Esperando parámetros</h3>
          <p className="text-slate-400 text-xs mt-1 font-medium italic">Selecciona un periodo para comenzar</p>
        </div>
      )}
    </div>
  );
}