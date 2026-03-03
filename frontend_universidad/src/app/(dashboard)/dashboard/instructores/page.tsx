// src/app/(dashboard)/dashboard/instructores/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InstructorForm } from "@/components/Forms/InstructorForm";
import { useRouter } from "next/navigation";

interface Instructor {
  id: string;
  nombre: string;
  especialidad: string;
  email: string;
  telefono: string;
  experiencia: string; // Cambiado a string para mostrar Sucursal
  cursos: number;
  avatar: string | null;
  estado: "activo" | "inactivo" | "vacaciones";
  username: string;
}

export default function InstructoresPage() {
  const { user } = useAuth();
  const { canView } = usePermission();
  const router = useRouter();
  const canEditPermission = canView(["admin", "teacher"]);

  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [filteredInstructores, setFilteredInstructores] = useState<
    Instructor[]
  >([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showInstructorModal, setShowInstructorModal] = useState(false);

  const itemsPerPage = 6;

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const isLocal = window.location.hostname === "localhost";
        const API_BASE_URL = isLocal
          ? "http://localhost:3001"
          : "https://backend-universidad.vercel.app";

        const response = await fetch(`${API_BASE_URL}/v1/users/instructors`);
        if (response.ok) {
          const data = await response.json();
          setInstructores(data);
          setFilteredInstructores(data);
        }
      } catch (err) {
        console.error("Error cargando instructores:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  useEffect(() => {
    const filtered = instructores.filter(
      (instructor) =>
        instructor.nombre.toLowerCase().includes(search.toLowerCase()) ||
        instructor.especialidad.toLowerCase().includes(search.toLowerCase()) ||
        instructor.email.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredInstructores(filtered);
    setCurrentPage(1);
  }, [search, instructores]);

  const totalPages = Math.ceil(filteredInstructores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInstructores = filteredInstructores.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-800";
      case "inactivo":
        return "bg-red-100 text-red-800";
      case "vacaciones":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-bold">
            Cargando equipo docente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showInstructorModal && (
        <InstructorForm onClose={() => setShowInstructorModal(false)} />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de Instructores
        </h1>
        <p className="text-gray-600">
          Administra los profesores y directivos de la universidad
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="w-full sm:w-96">
          <div className="relative">
            <Input
              type="text"
              className="pl-10"
              placeholder="Buscar por nombre o puesto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {canEditPermission && (
          <button
            onClick={() => setShowInstructorModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center shadow-sm font-medium transition-all"
          >
            Nuevo Instructor
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentInstructores.map((instructor) => (
          <div
            key={instructor.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  {instructor.avatar ? (
                    <img
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                      src={instructor.avatar}
                      alt={instructor.nombre}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                      {instructor.nombre.charAt(0)}
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 block h-4 w-4 rounded-full ring-2 ring-white bg-green-400`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {instructor.nombre}
                  </h3>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-tight">
                    {instructor.especialidad}
                  </p>
                  <span
                    className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(instructor.estado)}`}
                  >
                    {instructor.estado}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Email Corporativo
                  </p>
                  <p className="text-sm text-gray-900 truncate font-medium">
                    {instructor.email}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Puesto
                  </p>
                  <p className="text-xs text-gray-900 font-bold">
                    {instructor.especialidad.split(" ")[0]}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Sucursal
                  </p>
                  <p className="text-xs text-gray-900 font-bold truncate">
                    {instructor.experiencia}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-between items-center">
              <Button
                variant="link"
                className="text-blue-600 p-0 h-auto font-bold"
                onClick={() => router.push(`/profile/${instructor.username}`)}
              >
                Ver perfil completo
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
            <span className="font-medium">
              {Math.min(startIndex + itemsPerPage, filteredInstructores.length)}
            </span>{" "}
            de{" "}
            <span className="font-medium">{filteredInstructores.length}</span>
          </p>
          <div className="flex items-center space-x-2">
            {/* Botón Anterior */}
            <button
              className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Anterior
            </button>

            {/* Números de página */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`min-w-[2.5rem] px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? "bg-blue-600 text-white border border-blue-600"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    } transition-colors`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            {/* Botón Siguiente */}
            <button
              className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Instructores</p>
            <p className="text-2xl font-bold">{instructores.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mr-4">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Activos</p>
            <p className="text-2xl font-bold text-green-600">
              {instructores.filter((i) => i.estado === "activo").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mr-4">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cursos Totales</p>
            <p className="text-2xl font-bold text-purple-600">
              {instructores.reduce((sum, i) => sum + i.cursos, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
