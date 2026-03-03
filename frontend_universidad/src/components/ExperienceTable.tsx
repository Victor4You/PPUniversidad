// src/components/ExperienceTable.tsx
'use client';

import React from 'react';
import { Avatar } from './ui/Avatar/Avatar';
import { calculateWorkDuration } from '@/lib/utils';
import { UserProfile } from '@/lib/types/user.types';

export default function ExperienceTable({ users }: { users: UserProfile[] }) {
  return (
    <div className="w-full bg-white rounded-2xl md:rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
        <table className="w-full min-w-[600px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Colaborador</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Años</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Meses</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Días</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">F. Ingreso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => {
              const { years, months, days } = calculateWorkDuration(user.createdAt);
              return (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar} alt={user.name} size="w-9 h-9" />
                      <div>
                        <div className="text-sm font-bold text-slate-700 leading-tight">{user.name}</div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase">{user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-black text-blue-600 bg-blue-50 w-8 h-8 inline-flex items-center justify-center rounded-lg">{years}</span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-bold text-slate-600">{months}</td>
                  <td className="px-4 py-4 text-center text-sm font-bold text-slate-600">{days}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}