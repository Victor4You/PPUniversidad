// src/app/(dashboard)/dashboard/reportes/generacion-indicadores/page.tsx
"use client";

import React from "react";
import {
  BookOpen,
  Layers,
  PlayCircle,
  UserPlus,
  Edit3,
  Trash2,
  CheckCircle,
  Info,
  PlusCircle,
  FileText,
  Users,
  Search,
  GraduationCap,
  Award,
  AlertTriangle,
} from "lucide-react";

export default function ManualProfesorPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 pb-20 text-slate-800">
      {/* HEADER PRINCIPAL */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <BookOpen className="text-blue-600" size={36} />
          Guía de Configuración para Profesores 
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          Manual técnico para la creación de cursos, gestión de alumnos y
          criterios de certificación.
        </p>
      </div>

      {/* SECCIÓN 1: CREACIÓN Y EDICIÓN */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <PlusCircle className="text-green-600" />
          <h2>1. Creación y Edición de Cursos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* MODO ESTÁNDAR */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden border-t-4 border-t-blue-500">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <span className="font-bold flex items-center gap-2 text-blue-700">
                <PlayCircle size={18} /> MODO ESTÁNDAR
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                UN SOLO BLOQUE
              </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Identificación:</strong> Ingresa Nombre, Código,
                  Profesor, Créditos y Semestre.
                </p>
                <p>
                  <strong>Multimedia:</strong> Carga directa de videos y PDFs
                  que aparecerán al inicio del curso.
                </p>
                <p>
                  <strong>Evaluación:</strong> Configura el tiempo límite y
                  añade las preguntas directamente en la sección 4 del
                  formulario.
                </p>
              </div>
            </div>
          </div>

          {/* MODO SECCIONES */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden border-t-4 border-t-purple-500">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <span className="font-bold flex items-center gap-2 text-purple-700">
                <Layers size={18} /> MODO SECCIONES
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">
                MULTIMODULAR
              </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Gestión:</strong> Usa{" "}
                  <span className="text-purple-600 font-bold">
                    + AÑADIR SECCIÓN
                  </span>{" "}
                  para crear módulos independientes.
                </p>
                <p>
                  <strong>Contenido:</strong> Cada pestaña de sección permite
                  subir archivos específicos para ese tema.
                </p>
                <p>
                  <strong>Examen Único:</strong> Aunque haya varias secciones,
                  el examen es global y se presenta al final de todas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: EXÁMENES Y DIPLOMAS (NUEVA) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Award className="text-purple-600" />
          <h2>2. Exámenes y Diplomas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* TARJETA DE CRITERIOS */}
          <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-purple-600 p-4 flex items-center gap-3 text-white">
              <GraduationCap size={24} />
              <h3 className="font-bold">Criterios de Aprobación</h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-3 items-start">
                <CheckCircle className="text-green-500 shrink-0" size={20} />
                <p className="text-sm">
                  <strong>Preguntas:</strong> Se recomienda un mínimo de 5
                  preguntas de opción múltiple.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle className="text-green-500 shrink-0" size={20} />
                <p className="text-sm">
                  <strong>Calificación:</strong> La aprobación se logra
                  automáticamente con <strong>90 puntos</strong>.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle className="text-green-500 shrink-0" size={20} />
                <p className="text-sm">
                  <strong>Diploma:</strong> Se habilita para descarga
                  instantánea al aprobar.
                </p>
              </div>
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-800 leading-relaxed">
                  <strong>Importante:</strong> Verifica que el curso esté en
                  estado <strong>"Activo"</strong> para que el examen sea
                  visible para los alumnos.
                </p>
              </div>
            </div>
          </div>

          {/* BARRA DE HERRAMIENTAS RÁPIDA */}
          <div className="md:col-span-2 bg-slate-900 rounded-2xl p-8 text-white flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Edit3 className="text-blue-400" />
              Acciones de Gestión
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">Inscribir Alumnos</p>
                  <p className="text-xs text-slate-400">
                    Control de acceso y sucursales.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Edit3 size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">Editar Contenido</p>
                  <p className="text-xs text-slate-400">
                    Modificar preguntas y archivos.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">Vista Previa</p>
                  <p className="text-xs text-slate-400">
                    Ver el curso como estudiante.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                  <Trash2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">Eliminar</p>
                  <p className="text-xs text-slate-400">
                    Remover curso definitivamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: ADMINISTRACIÓN DE ALUMNOS */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <UserPlus className="text-blue-600" />
          <h2>3. Administración de Estudiantes</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-3">
          <div className="p-8 bg-slate-50 border-r border-slate-200 space-y-6">
            <div>
              <h4 className="font-bold flex items-center gap-2 mb-2 italic">
                <Search size={18} className="text-blue-600" /> Filtrar por
                Sucursal
              </h4>
              <p className="text-sm text-slate-600">
                Selecciona la sucursal (ej: Centro, Gran Plaza) para ver solo al
                personal de esa área.
              </p>
            </div>
            <div>
              <h4 className="font-bold flex items-center gap-2 mb-2 italic">
                <PlusCircle size={18} className="text-green-600" /> Inscripción
                Manual
              </h4>
              <p className="text-sm text-slate-600">
                Haz clic en el botón{" "}
                <span className="text-blue-600 font-bold">+ INSCRIBIR</span> que
                aparece junto al nombre buscado.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 p-8 flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
                <p className="text-xs font-bold text-red-700 uppercase mb-1">
                  Estatus Expirado
                </p>
                <p className="text-sm text-red-800">
                  Si un curso muestra la etiqueta <strong>EXPIRADO</strong>, el
                  alumno ya no podrá realizar el examen. Ajusta la "Fecha
                  Límite" para darle más tiempo.
                </p>
              </div>
              <div className="flex-1 p-4 bg-amber-50 rounded-xl border-l-4 border-amber-500">
                <p className="text-xs font-bold text-amber-700 uppercase mb-1">
                  Guardado Obligatorio
                </p>
                <p className="text-sm text-amber-800">
                  Cualquier cambio en la lista de alumnos o datos del curso
                  requiere presionar el botón <strong>GUARDAR CAMBIOS</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
