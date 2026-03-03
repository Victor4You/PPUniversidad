'use client';

import React from 'react';
import { Avatar } from './ui/Avatar/Avatar';
import { calculateWorkDuration } from '@/lib/utils';
import { UserProfile } from '@/lib/types/user.types';

interface ExperienceCardProps {
  user: UserProfile;
}

export default function ExperienceCard ({ user }: ExperienceCardProps) {
  // Usa la fecha de creación como fecha de ingreso según tu interface UserProfile
  const duration = calculateWorkDuration(user.createdAt);

  return (
    <div className="w-[320px] bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col items-center">
      {/* Sección Superior: Fondo de color y Avatar */}
      <div className="w-full h-32 bg-linear-to-b from-blue-500 to-blue-600 flex justify-center relative">
        <div className="absolute top-12">
          <Avatar 
            src={user.avatar} 
            alt={user.name} 
            size="w-32 h-32" 
            className="ring-8 ring-white shadow-md bg-white"
          />
        </div>
      </div>

      {/* Sección Media: Info del Usuario */}
      <div className="mt-16 px-6 text-center w-full">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight uppercase">
          {user.name}
        </h2>
        <p className="text-blue-500 font-bold text-sm tracking-wider mt-1 mb-8 uppercase">
          {user.role || 'Colaborador'}
        </p>

        {/* Sección Inferior: El Contador de Aniversario (Estilo imagen) */}
        <div className="flex justify-between items-center bg-slate-50 rounded-3xl py-6 px-4 mb-8 border border-slate-100">
          <div className="flex flex-col flex-1 items-center">
            <span className="text-3xl font-black text-slate-800 leading-none">
              {duration.years}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
              Años
            </span>
          </div>
          
          <div className="h-10 w-[1px] bg-slate-200"></div>

          <div className="flex flex-col flex-1 items-center">
            <span className="text-3xl font-black text-slate-800 leading-none">
              {duration.months}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
              Meses
            </span>
          </div>

          <div className="h-10 w-[1px] bg-slate-200"></div>

          <div className="flex flex-col flex-1 items-center">
            <span className="text-3xl font-black text-slate-800 leading-none">
              {duration.days}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
              Días
            </span>
          </div>
        </div>
      </div>

      {/* Pie de página con la fecha de ingreso */}
      <div className="w-full bg-slate-800 py-3 text-center">
        <p className="text-[10px] text-slate-300 font-medium tracking-[0.2em] uppercase">
          Fecha de Ingreso: {new Date(user.createdAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
}