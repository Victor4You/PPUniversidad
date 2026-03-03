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

  // NUEVO: Estado para controlar qué categorías están marcadas
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    Record<string, boolean>
  >({
    calificaciones: true,
    asistencias: true,
    inscripciones: true,
    matriculas: false,
    evaluaciones: false,
    tareas: false,
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
    setExportando(true);
    try {
      // Filtramos solo las llaves que están en true
      const categoriasAExportar = Object.keys(categoriasSeleccionadas).filter(
        (key) => categoriasSeleccionadas[key],
      );

      const response = await api.post(
        "reports/export",
        {
          format: formato,
          range: rangoFecha,
          includeCharts: incluirGraficas,
          includeDetails: incluirDatos,
          // CAMBIO AQUÍ: Usamos 'dataTypes' para que el backend lo reconozca
          dataTypes: categoriasAExportar,
        },
        { responseType: "blob" },
      );

      // Crear link de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Ajuste de extensión basado en la respuesta del backend
      const extension = formato === "excel" ? "xlsx" : formato;
      link.setAttribute(
        "download",
        `Reporte_${rangoFecha}_${Date.now()}.${extension}`,
      );

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

  // Categorías de datos relacionadas con cursos - Cantidades dinámicas si existen
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
    { id: "tareas", nombre: "Tareas", icono: "📚", cantidad: "Entregas" },
  ];

  // Calcular valores máximos para gráficos
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
      {/* Header de la página con título y descripción */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Exportación de Reportes Académicos
        </h1>
        <p className="text-gray-600">
          Exporta datos e informes de rendimiento académico
        </p>
      </div>

      {/* Panel principal de exportación */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda - Configuración */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configuración del Reporte
              </h3>

              {/* Selección de formato */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Formato del Reporte
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {formatosDisponibles.map((formatoItem) => (
                    <button
                      key={formatoItem.id}
                      onClick={() => setFormato(formatoItem.id)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        formato === formatoItem.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {formatoItem.icono}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatoItem.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatoItem.descripcion}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rango de fechas */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Periodo Académico
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {rangosFecha.map((rango) => (
                    <button
                      key={rango.id}
                      onClick={() => setRangoFecha(rango.id)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        rangoFecha === rango.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-medium text-gray-900">
                        {rango.nombre}
                      </p>
                      <p className="text-xs text-gray-500">
                        {rango.descripcion}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modo de exportación */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Tipo de Reporte
                </h4>
                <div className="space-y-2">
                  {modosExportacion.map((modo) => (
                    <button
                      key={modo.id}
                      onClick={() => setModoExportacion(modo.id)}
                      className={`w-full p-3 border rounded-lg text-left transition-colors ${
                        modoExportacion === modo.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">
                            {modo.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {modo.descripcion}
                          </p>
                        </div>
                        {modoExportacion === modo.id && (
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna derecha - Opciones avanzadas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contenido del Reporte
              </h3>

              {/* Opciones de contenido */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Elementos a Incluir
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={incluirGraficas}
                          onChange={(e) => setIncluirGraficas(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
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
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={incluirDatos}
                          onChange={(e) => setIncluirDatos(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
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
              </div>

              {/* Selección de categorías de datos */}
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
                  {categoriasDatos.map((categoria) => (
                    <div
                      key={categoria.id}
                      className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={categoriasSeleccionadas[categoria.id]}
                            onChange={() => handleToggleCategoria(categoria.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 flex items-center">
                          <span className="text-lg mr-2">
                            {categoria.icono}
                          </span>
                          <div>
                            <label className="font-medium text-gray-900">
                              {categoria.nombre}
                            </label>
                            <p className="text-xs text-gray-500">
                              {categoria.cantidad}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vista previa del reporte */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Vista Previa del Reporte
                </h4>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Reporte Académico -{" "}
                        {rangosFecha.find((r) => r.id === rangoFecha)?.nombre ||
                          "Personalizado"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Formato: {formato.toUpperCase()} • Incluye:{" "}
                        {incluirGraficas ? "Gráficas, " : ""}
                        {incluirDatos ? "Datos detallados" : ""}
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
          </div>

          {/* Botón de exportación */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  {exportando
                    ? "Generando reporte académico..."
                    : "Reporte listo para exportar"}
                </p>
                <p className="text-xs text-gray-500">
                  El reporte incluirá datos de{" "}
                  {
                    Object.values(categoriasSeleccionadas).filter(Boolean)
                      .length
                  }{" "}
                  categorías seleccionadas
                </p>
              </div>
              <button
                onClick={handleExportar}
                disabled={exportando}
                className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                  exportando
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white transition-colors`}
              >
                {exportando ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generando...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                    Exportar Reporte
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Gráficos Académicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Rendimiento por Curso */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Rendimiento por Curso
              </h3>
              <p className="text-sm text-gray-500">
                Promedio de calificaciones por materia
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {rendimientoCursos.length}
              </p>
              <p className="text-sm text-gray-500">cursos evaluados</p>
            </div>
          </div>

          <div className="h-64">
            <div className="flex items-end h-48 space-x-2 mt-4">
              {rendimientoCursos.map((curso: any, index: number) => {
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center group"
                  >
                    <div className="text-xs text-gray-500 mb-1 truncate w-full text-center">
                      {curso.curso.split(" ")[0]}
                    </div>
                    <div className="relative w-full flex justify-center">
                      <div className="flex flex-col items-center w-3/4">
                        <div
                          className="w-full bg-linear-to-t from-green-500 to-green-400 rounded-t-lg hover:from-green-600 hover:to-green-500 transition-all"
                          style={{ height: `${curso.promedio}%` }}
                          title={`${curso.promedio}% Promedio`}
                        ></div>
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {curso.curso}: {curso.promedio}/100
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs text-gray-600">
                  Promedio de Aprobación
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Distribución de Calificaciones */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Distribución de Calificaciones
              </h3>
              <p className="text-sm text-gray-500">
                Total de calificaciones: {totalCalificaciones}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {distribucionCalificaciones.length > 0
                  ? distribucionCalificaciones
                      .filter((i: any) => i.min >= 60)
                      .reduce(
                        (acc: number, cur: any) => acc + cur.porcentaje,
                        0,
                      )
                      .toFixed(1)
                  : "0"}
                %
              </p>
              <p className="text-sm text-gray-500">aprobación</p>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg
                width="192"
                height="192"
                viewBox="0 0 192 192"
                className="absolute inset-0"
              >
                {(() => {
                  let anguloAcumulado = 0;
                  const radio = 80;
                  const centroX = 96;
                  const centroY = 96;

                  return distribucionCalificaciones.map(
                    (item: any, index: number) => {
                      const porcentaje = item.porcentaje;
                      if (porcentaje === 0) return null;

                      const angulo = (porcentaje / 100) * 360;
                      const anguloRad = (anguloAcumulado * Math.PI) / 180;
                      const anguloFinalRad =
                        ((anguloAcumulado + angulo) * Math.PI) / 180;

                      const x1 = centroX + radio * Math.cos(anguloRad);
                      const y1 = centroY + radio * Math.sin(anguloRad);
                      const x2 = centroX + radio * Math.cos(anguloFinalRad);
                      const y2 = centroY + radio * Math.sin(anguloFinalRad);

                      const largeArc = angulo > 180 ? 1 : 0;

                      const pathData = [
                        `M ${centroX} ${centroY}`,
                        `L ${x1} ${y1}`,
                        `A ${radio} ${radio} 0 ${largeArc} 1 ${x2} ${y2}`,
                        `Z`,
                      ].join(" ");

                      anguloAcumulado += angulo;

                      return (
                        <path
                          key={index}
                          d={pathData}
                          fill={item.color}
                          className="hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      );
                    },
                  );
                })()}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
                  <span className="text-2xl font-bold text-gray-900">
                    {totalCalificaciones}
                  </span>
                  <span className="text-xs text-gray-500">total</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {distribucionCalificaciones.map((item: any, index: number) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">{item.rango}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.porcentaje}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Reportes Recientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Reportes Recientes
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Ver todos los reportes →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de Reporte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cursos Incluidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generado Por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        15 Ene 2024
                      </div>
                      <div className="text-sm text-gray-500">10:30 AM</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Calificaciones
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Todos los cursos
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Admin
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      Descargar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
