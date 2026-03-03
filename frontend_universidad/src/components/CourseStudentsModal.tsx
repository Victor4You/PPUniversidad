"use client";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

const XMarkIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const UserIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);
const SearchIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export default function CourseStudentsModal({
  isOpen,
  onClose,
  courseData,
  onUpdateCourse,
}: any) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [inscritos, setInscritos] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sucursalId, setSucursalId] = useState("");
  const [isSearchingSucursal, setIsSearchingSucursal] = useState(false);

  // NUEVO: Estado para las sucursales y carga inicial
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSeeStudentProfile = (studentUsername: string) => {
    onClose();
    router.push(`/profile/${studentUsername}`);
  };

  // Cargar sucursales al abrir el modal
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get("/courses/branches/list");
        setSucursales(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error cargando sucursales:", err);
      }
    };
    if (isOpen) fetchBranches();
  }, [isOpen]);

  useEffect(() => {
    if (courseData?.estudiantesInscritos) {
      setInscritos(courseData.estudiantesInscritos);
    }
  }, [courseData]);

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length >= 1 || sucursalId) {
      const timer = setTimeout(() => fetchUsers(term), 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, sucursalId]);

  useEffect(() => {
    const cargarAsignados = async () => {
      // Validamos que el ID sea un número válido
      if (isOpen && courseData?.id && courseData.id !== "undefined") {
        try {
          const res = await api.get(`/courses/${courseData.id}/students`);

          if (res.data && Array.isArray(res.data)) {
            // Normalizamos la respuesta del backend (NestJS/TypeORM suele devolver 'username' y 'name')
            const datosBase = res.data.map((s: any) => ({
              id: s.id,
              name: s.name || s.nombre || `Usuario ${s.id}`,
              username: s.username || s.usuario || "S/N",
              role: s.role || "estudiante",
            }));

            setInscritos(datosBase);
          }
        } catch (error) {
          console.error("Error cargando alumnos inscritos:", error);
        }
      }
    };
    cargarAsignados();
  }, [isOpen, courseData?.id]);

  const fetchUsers = async (query: string) => {
    const idBusqueda = sucursalId || "0";
    setIsSearching(true);
    try {
      const response = await api.get(
        `/courses/users/sucursal/${idBusqueda}?q=${query}`,
      );

      if (response.data && Array.isArray(response.data)) {
        const filtrados = response.data.filter(
          (user: any) =>
            !inscritos.some(
              (s) =>
                (s.username || "").toLowerCase() ===
                (user.usuario || user.username || "").toLowerCase(),
            ),
        );
        setSearchResults(filtrados);
      }
    } catch (error: any) {
      console.error("Error en búsqueda:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleInscripcion = (user: any) => {
    const userKey = user.usuario || user.username;
    const userId = user.id;

    const isAlreadyIn = inscritos.some(
      (s) => s.username === userKey || s.id === userId,
    );

    if (isAlreadyIn) {
      setInscritos((prev) => prev.filter((s) => s.id !== userId));
    } else {
      const newStudent = {
        id: userId,
        name:
          user.name ||
          `${user.nombre || ""} ${user.apellido || ""}`.trim() ||
          userKey,
        username: userKey,
        role: user.role || "estudiante",
      };
      setInscritos((prev) => [...prev, newStudent]);
      setSearchTerm("");
      setSearchResults([]);
    }
  };

  // Optimizamos el guardado masivo
  const handleSave = async () => {
    try {
      setLoading(true);
      if (!courseData?.id || courseData.id === "undefined") {
        alert("Error: ID de curso no válido");
        return;
      }

      // Enviamos solo los IDs al endpoint de NestJS
      await api.post(`/courses/${courseData.id}/students`, {
        userIds: inscritos.map((s) => Number(s.id)), // Aseguramos que sean números
      });

      if (onUpdateCourse) await onUpdateCourse();
      onClose();
      alert("✅ Lista de alumnos actualizada correctamente.");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al sincronizar con la base de datos");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchBySucursal = async () => {
    if (!sucursalId) return;
    setIsSearchingSucursal(true);
    try {
      const res = await api.get(`/courses/users/sucursal/${sucursalId}?q=`);
      if (res.data && Array.isArray(res.data)) {
        const filtrados = res.data.filter((user: any) => {
          const uKey = (user.usuario || user.username || "").toLowerCase();
          return !inscritos.some(
            (s) => (s.username || "").toLowerCase() === uKey,
          );
        });
        setSearchResults(filtrados);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearchingSucursal(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-white px-8 pb-8 pt-6 text-left shadow-2xl transition-all sm:w-full sm:max-w-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
                    Gestión de Alumnos
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {courseData?.nombre}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon />
                </button>
              </div>

              {/* CONTENEDOR DE BUSCADORES */}
              <div className="flex gap-2 mb-6">
                {/* BUSCADOR POR SUCURSAL (SELECT MEJORADO) */}
                <div className="relative w-1/3">
                  <select
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-3 px-4 text-[10px] font-black outline-none transition-all uppercase appearance-none cursor-pointer"
                    value={sucursalId}
                    onChange={(e) => setSucursalId(e.target.value)}
                  >
                    <option value="">TODAS LAS SUC.</option>
                    {sucursales.map((suc) => (
                      <option key={suc.id} value={suc.id}>
                        {suc.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* BUSCADOR POR NOMBRE */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                    {isSearching ? (
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    ) : (
                      <SearchIcon />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="BUSCAR POR NOMBRE..."
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none transition-all uppercase"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  {/* DROPDOWN DE RESULTADOS */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-white border-2 border-blue-600 rounded-2xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id || user.usuario || user.username}
                          onClick={() => handleToggleInscripcion(user)}
                          className="w-full flex items-center justify-between p-4 hover:bg-blue-50 transition-colors border-b last:border-none text-left"
                        >
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {user.name ||
                                `${user.nombre || ""} ${user.apellido || ""}`.trim() ||
                                user.usuario ||
                                "Usuario sin nombre"}
                            </p>
                            <p className="text-[10px] text-blue-600 font-black">
                              @{user.usuario || user.username} •{" "}
                              <span className="text-orange-500">
                                {user.puesto || "COLABORADOR"}
                              </span>
                            </p>
                          </div>
                          <span className="text-blue-600 font-black text-[10px] uppercase">
                            + Inscribir
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
                  Lista Actual ({inscritos.length})
                </h4>

                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {inscritos.length > 0 ? (
                    inscritos.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-[1.5rem]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <UserIcon />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                handleSeeStudentProfile(student.username)
                              }
                              className="font-bold text-gray-900 text-sm hover:text-blue-600 transition-colors block text-left"
                            >
                              {student.name || `ESTUDIANTE ${student.id}`}
                            </button>
                            <div className="text-[10px] text-gray-500 uppercase font-black">
                              @{student.username || student.usuario || "S/N"}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleInscripcion(student)}
                          aria-label={`Desinscribir a ${student.name}`}
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-green-600"
                        >
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        Busca alumnos para el curso
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-800 transition-colors"
                >
                  Descartar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all uppercase text-[10px] tracking-widest disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
