// src/app/(dashboard)/dashboard/reportes/exportacion-datos/page.tsx
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api/axios";

export default function ExportacionDatosPage() {
  const [formato, setFormato] = useState<string>("pdf");
  const [rangoFecha, setRangoFecha] = useState<string>("mes");
  const [modoExportacion, setModoExportacion] = useState<string>("automatico");
  const [incluirGraficas, setIncluirGraficas] = useState<boolean>(true);
  const [incluirDatos, setIncluirDatos] = useState<boolean>(true);
  const [exportando, setExportando] = useState<boolean>(false);

  // --- ESTADOS PARA INFORMACIÓN REAL ---
  const [statsReales, setStatsReales] = useState<any>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  // --- NUEVO: ESTADOS PARA BÚSQUEDA DE ALUMNO (KARDEX) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any>(null);

  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    Record<string, boolean>
  >({
    calificaciones: true,
    asistencias: true,
    inscripciones: true,
    matriculas: false,
    evaluaciones: false,
    kardex: false, // Cambiado de 'tareas' a 'kardex'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("reports/stats");
        setStatsReales(res.data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchStats();
  }, []);

  // Lógica de búsqueda de alumnos (solo si kardex está activo)
  useEffect(() => {
    const buscarAlumnos = async () => {
      if (searchTerm.trim().length < 2 || !categoriasSeleccionadas.kardex) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await api.get(`/courses/users/sucursal/0?q=${searchTerm}`);
        setSearchResults(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error(error);
      }
    };
    const timer = setTimeout(buscarAlumnos, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, categoriasSeleccionadas.kardex]);

  // --- HANDLERS ---
  const handleSeleccionarTodos = () => {
    const todosTrue = Object.keys(categoriasSeleccionadas).reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    setCategoriasSeleccionadas(todosTrue);
  };

  const handleToggleCategoria = (id: string) => {
    setCategoriasSeleccionadas((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExportar = async () => {
    if (categoriasSeleccionadas.kardex && !alumnoSeleccionado) {
      alert("Por favor selecciona un alumno para generar el Kardex");
      return;
    }

    setExportando(true);
    try {
      const categoriasAExportar = Object.keys(categoriasSeleccionadas).filter(
        (key) => categoriasSeleccionadas[key],
      );

      // Si solo es Kardex, usamos la ruta específica, si no, la general
      const endpoint =
        categoriasSeleccionadas.kardex && categoriasAExportar.length === 1
          ? `/courses/kardex/${alumnoSeleccionado.id}` // Agregado / al principio
          : "/reports/export"; // Agregado / al principio

      const response = await api.post(
        endpoint,
        {
          format: formato,
          range: rangoFecha,
          includeCharts: incluirGraficas,
          includeDetails: incluirDatos,
          dataTypes: categoriasAExportar,
          alumnoId: alumnoSeleccionado?.id,
        },
        { responseType: "blob" }, // Esto es vital para que el PDF no se corrompa
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const extension = formato === "excel" ? "xlsx" : formato;

      const nombreArchivo =
        categoriasSeleccionadas.kardex && alumnoSeleccionado
          ? `Kardex_${alumnoSeleccionado.name}.${extension}`
          : `Reporte_${rangoFecha}_${Date.now()}.${extension}`;

      link.setAttribute("download", nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar:", error);
    } finally {
      setExportando(false);
    }
  };

  const formatosDisponibles = [
    {
      id: "pdf",
      nombre: "PDF Document",
      descripcion: "Reportes completos con gráficos",
      icono: "📄",
    },
    {
      id: "excel",
      nombre: "Excel Spreadsheet",
      descripcion: "Datos para análisis estadístico",
      icono: "📊",
    },
    {
      id: "csv",
      nombre: "CSV File",
      descripcion: "Datos para importación a sistemas",
      icono: "📋",
    },
    {
      id: "json",
      nombre: "JSON Data",
      descripcion: "Formato para desarrolladores",
      icono: "🔧",
    },
  ];

  const rangosFecha = [
    { id: "hoy", nombre: "Hoy", descripcion: "Datos del día actual" },
    {
      id: "semana",
      nombre: "Última semana",
      descripcion: "Datos de los últimos 7 días",
    },
    {
      id: "mes",
      nombre: "Último mes",
      descripcion: "Datos de los últimos 30 días",
    },
    {
      id: "trimestre",
      nombre: "Último trimestre",
      descripcion: "Datos de los últimos 90 días",
    },
    {
      id: "anio",
      nombre: "Último año",
      descripcion: "Datos de los últimos 365 días",
    },
    {
      id: "personalizado",
      nombre: "Personalizado",
      descripcion: "Selecciona un rango específico",
    },
  ];

  const modosExportacion = [
    {
      id: "automatico",
      nombre: "Automático",
      descripcion: "Exportación programada automáticamente",
    },
    { id: "manual", nombre: "Manual", descripcion: "Exportación bajo demanda" },
    {
      id: "recurrente",
      nombre: "Recurrente",
      descripcion: "Exportación periódica",
    },
  ];

  const categoriasDatos = [
    {
      id: "calificaciones",
      nombre: "Calificaciones",
      icono: "📝",
      cantidad: `${statsReales?.totalCalificaciones || 0} registros`,
    },
    {
      id: "asistencias",
      nombre: "Asistencias",
      icono: "📅",
      cantidad: "Sincronizado",
    },
    {
      id: "inscripciones",
      nombre: "Inscripciones",
      icono: "👤",
      cantidad: `${statsReales?.totalInscripciones || 0} registros`,
    },
    {
      id: "matriculas",
      nombre: "Matrículas",
      icono: "💳",
      cantidad: "Datos financieros",
    },
    {
      id: "evaluaciones",
      nombre: "Evaluaciones",
      icono: "📊",
      cantidad: "Resultados test",
    },
    {
      id: "kardex",
      nombre: "Kardex Académico",
      icono: "🎓",
      cantidad: "Historial por alumno",
    }, // Reemplaza Tareas
  ];

  const rendimientoCursos = statsReales?.rendimiento || [];
  const distribucionCalificaciones = statsReales?.distribucion || [];
  const totalCalificaciones = statsReales?.totalCalificaciones || 0;

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Exportación de Reportes Académicos
        </h1>
        <p className="text-gray-600">
          Exporta datos e informes de rendimiento académico
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda - Configuración */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configuración del Reporte
              </h3>
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Formato del Reporte
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {formatosDisponibles.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFormato(f.id)}
                      className={`p-4 border rounded-lg text-left transition-colors ${formato === f.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{f.icono}</span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {f.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {f.descripcion}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Periodo Académico
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {rangosFecha.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRangoFecha(r.id)}
                      className={`p-3 border rounded-lg text-left transition-colors ${rangoFecha === r.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      <p className="font-medium text-gray-900">{r.nombre}</p>
                      <p className="text-xs text-gray-500">{r.descripcion}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Tipo de Reporte
                </h4>
                <div className="space-y-2">
                  {modosExportacion.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setModoExportacion(m.id)}
                      className={`w-full p-3 border rounded-lg text-left transition-colors ${modoExportacion === m.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">
                            {m.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {m.descripcion}
                          </p>
                        </div>
                        {modoExportacion === m.id && (
                          <div className="w-5 h-5 text-blue-600">✓</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna derecha - Contenido */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contenido del Reporte
              </h3>

              {/* BUSCADOR DE ALUMNO (Solo si Kardex está seleccionado) */}

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={incluirGraficas}
                      onChange={(e) => setIncluirGraficas(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <div className="ml-3">
                      <label className="font-medium text-gray-900">
                        Incluir gráficas de rendimiento
                      </label>
                      <p className="text-xs text-gray-500">
                        Gráficas de calificaciones y distribución
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={incluirDatos}
                      onChange={(e) => setIncluirDatos(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <div className="ml-3">
                      <label className="font-medium text-gray-900">
                        Incluir datos detallados por estudiante
                      </label>
                      <p className="text-xs text-gray-500">
                        Reportes individuales de calificaciones y asistencias
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Datos Académicos
                  </h4>
                  <button
                    onClick={handleSeleccionarTodos}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Seleccionar todos
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {categoriasDatos.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={categoriasSeleccionadas[cat.id]}
                          onChange={() => handleToggleCategoria(cat.id)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <div className="ml-3 flex items-center">
                          <span className="text-lg mr-2">{cat.icono}</span>
                          <div>
                            <label className="font-medium text-gray-900">
                              {cat.nombre}
                            </label>
                            <p className="text-xs text-gray-500">
                              {cat.cantidad}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {categoriasSeleccionadas.kardex && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in duration-300">
                      <label className="text-xs font-bold text-blue-800 uppercase">
                        Seleccionar Alumno para Kardex
                      </label>
                      <input
                        type="text"
                        className="w-full mt-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchResults.length > 0 && (
                        <div className="mt-1 bg-white border rounded shadow-xl max-h-40 overflow-y-auto">
                          {searchResults.map((u) => (
                            <div
                              key={u.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => {
                                setAlumnoSeleccionado(u);
                                setSearchResults([]);
                                setSearchTerm(u.name);
                              }}
                            >
                              {u.name}{" "}
                              <span className="text-xs text-gray-400">
                                ({u.username})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {alumnoSeleccionado && (
                        <p className="mt-2 text-xs font-semibold text-green-700 flex items-center">
                          <span className="mr-1">✓</span> Alumno:{" "}
                          {alumnoSeleccionado.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Reporte Académico -{" "}
                      {rangosFecha.find((r) => r.id === rangoFecha)?.nombre}
                    </p>
                    <p className="text-sm text-gray-500">
                      Formato: {formato.toUpperCase()} •{" "}
                      {incluirGraficas ? "Gráficas" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {Object.values(categoriasSeleccionadas).filter(Boolean)
                        .length * 100}
                      +
                    </p>
                    <p className="text-xs text-gray-500">registros aprox.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {exportando
                  ? "Generando reporte académico..."
                  : "Reporte listo para exportar"}
              </p>
              <p className="text-xs text-gray-500">
                Incluye{" "}
                {Object.values(categoriasSeleccionadas).filter(Boolean).length}{" "}
                categorías
              </p>
            </div>

            <button
              onClick={handleExportar}
              disabled={exportando}
              className={`px-6 py-3 rounded-lg font-medium flex items-center ${exportando ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} text-white transition-colors`}
            >
              {exportando ? "Generando..." : "Exportar Reporte"}
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE GRÁFICOS (Original intacta) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rendimiento por Curso
          </h3>
          <div className="h-64 flex items-end space-x-2 mt-4">
            {rendimientoCursos.map((curso: any, index: number) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                <div className="text-xs text-gray-500 mb-1 truncate w-full text-center">
                  {curso.curso.split(" ")[0]}
                </div>
                <div
                  className="w-3/4 bg-linear-to-t from-green-500 to-green-400 rounded-t-lg"
                  style={{ height: `${curso.promedio}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución
          </h3>
          <div className="w-48 h-48 rounded-full border-8 border-blue-500 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{totalCalificaciones}</span>
            <span className="text-xs text-gray-500 uppercase">Total</span>
          </div>
        </div>
      </div>

      {/* TABLA DE REPORTES RECIENTES (Original intacta) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reportes Recientes
        </h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase">
              <th className="py-3">Fecha</th>
              <th className="py-3">Tipo</th>
              <th className="py-3">Cursos</th>
              <th className="py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-4 text-sm font-medium">15 Ene 2024</td>
              <td className="py-4">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Calificaciones
                </span>
              </td>
              <td className="py-4 text-sm text-gray-500">Todos los cursos</td>
              <td className="py-4 text-right">
                <button className="text-blue-600 text-sm font-medium">
                  Descargar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
