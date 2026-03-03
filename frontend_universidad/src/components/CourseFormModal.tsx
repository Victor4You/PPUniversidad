"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";

// ICONOS ORIGINALES
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
const TrashIcon = () => (
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
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

export default function CourseFormModal({
  isOpen,
  onClose,
  courseData,
  onSave,
}: any) {
  // DATOS GENERALES
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [profesor, setProfesor] = useState("");
  const [creditos, setCreditos] = useState(0);
  const [semestre, setSemestre] = useState("");
  const [estado, setEstado] = useState("activo");
  const [duracion, setDuracion] = useState(30);
  const [fechaLimite, setFechaLimite] = useState("");
  const [createdAt, setCreatedAt] = useState(
    new Date().toISOString().split("T")[0],
  );

  // LÓGICA DE SECCIONES
  const [tipo, setTipo] = useState("general");
  const [secciones, setSecciones] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  // ARRAYS PARA MODO GENERAL (EL ORIGINAL)
  const [videosGen, setVideosGen] = useState<any[]>([]);
  const [pdfsGen, setPdfsGen] = useState<any[]>([]);
  const [questionsGen, setQuestionsGen] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (courseData) {
        setNombre(courseData.nombre || "");
        setCodigo(courseData.codigo || "");
        setProfesor(courseData.profesor || "");
        setCreditos(courseData.creditos || 0);
        setSemestre(courseData.semestre || "");
        setEstado(courseData.estado || "activo");
        setDuracion(courseData.duracionExamen || 30);
        setTipo(courseData.tipo || "general");
        setFechaLimite(
          courseData.fechaLimite ? courseData.fechaLimite.slice(0, 16) : "",
        );
        setCreatedAt(
          courseData.createdAt
            ? new Date(courseData.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        );

        setSecciones(courseData.secciones || []);
        setVideosGen(courseData.videos || []);
        setPdfsGen(courseData.pdfs || []);
        setQuestionsGen(courseData.questions || []);
      } else {
        setNombre("");
        setCodigo("");
        setProfesor("");
        setCreditos(0);
        setSemestre("");
        setEstado("activo");
        setDuracion(30);
        setFechaLimite("");
        setTipo("general");
        setSecciones([]);
        setVideosGen([]);
        setPdfsGen([]);
        setQuestionsGen([]);
      }
    }
  }, [courseData, isOpen]);

  // HELPERS PARA MANEJAR CONTENIDO INDEPENDIENTE
  const updateContent = (key: string, data: any) => {
    if (tipo === "general") {
      if (key === "videos") setVideosGen(data);
      if (key === "pdfs") setPdfsGen(data);
      if (key === "questions") setQuestionsGen(data);
    } else {
      const newSecciones = [...secciones];
      if (newSecciones[activeTab]) {
        newSecciones[activeTab] = { ...newSecciones[activeTab], [key]: data };
        setSecciones(newSecciones);
      }
    }
  };

  const getContent = (key: string) => {
    if (tipo === "general") {
      return key === "videos"
        ? videosGen
        : key === "pdfs"
          ? pdfsGen
          : questionsGen;
    }
    return secciones[activeTab]?.[key] || [];
  };

  const handleFileUpload = async (
    index: number,
    type: "video" | "pdf",
    fileRaw: File,
  ) => {
    const formData = new FormData();
    formData.append("file", fileRaw);
    try {
      // API URL con fallback para local y compatible con Vercel env
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

      // RUTA CORREGIDA: Agregado /courses para evitar el error 404
      const res = await axios.post(`${apiUrl}/courses/upload`, formData);

      const list = [...getContent(type === "video" ? "videos" : "pdfs")];
      list[index].fileUrl = res.data.url;
      updateContent(type === "video" ? "videos" : "pdfs", list);
    } catch (e) {
      console.error("Error subiendo archivo:", e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construimos el objeto de salida asegurando que las secciones lleven su contenido
    const coursePayload = {
      ...courseData, // Mantenemos IDs u otros metadatos
      nombre,
      codigo,
      profesor,
      creditos,
      semestre,
      estado,
      tipo,
      duracionExamen: duracion,
      fechaLimite,
      createdAt, // Mantenemos la fecha original
      // Si es general, enviamos los arrays raíz. Si es specialized, enviamos vacíos los raíz.
      videos: tipo === "general" ? videosGen : [],
      pdfs: tipo === "general" ? pdfsGen : [],
      questions: tipo === "general" ? questionsGen : [],
      // Enviamos las secciones con sus respectivos videos/pdfs/questions
      secciones: tipo === "specialized" ? secciones : [],
    };

    onSave(coursePayload);
    // No cerramos aquí manualmente para dejar que el padre controle el ciclo de vida
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div className="flex items-center gap-4">
                  <Dialog.Title className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
                    {courseData ? "EDITAR CURSO" : "CREAR NUEVO CURSO"}
                  </Dialog.Title>
                  <div className="flex bg-gray-100 p-1 rounded-full scale-90">
                    <button
                      type="button"
                      onClick={() => setTipo("general")}
                      className={`px-4 py-1 rounded-full text-[9px] font-black uppercase transition-all ${tipo === "general" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"}`}
                    >
                      Estándar
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipo("specialized")}
                      className={`px-4 py-1 rounded-full text-[9px] font-black uppercase transition-all ${tipo === "specialized" ? "bg-purple-600 text-white shadow-sm" : "text-gray-400"}`}
                    >
                      Secciones
                    </button>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <XMarkIcon />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-10 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar"
              >
                {/* 1. DATOS DE LA TARJETA */}
                <div className="bg-gray-50 p-6 rounded-3xl space-y-6 border border-gray-100">
                  <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
                    1. DATOS DE LA TARJETA E IDENTIFICACIÓN
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">
                        Nombre del curso
                      </label>
                      <input
                        required
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none font-bold bg-white shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">
                        Código
                      </label>
                      <input
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none bg-white shadow-sm"
                        placeholder="EJ: MAT101"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">
                        Profesor
                      </label>
                      <input
                        value={profesor}
                        onChange={(e) => setProfesor(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl outline-none bg-white shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">
                        Créditos
                      </label>
                      <input
                        type="number"
                        value={creditos}
                        onChange={(e) => setCreditos(Number(e.target.value))}
                        className="w-full px-4 py-2 rounded-xl outline-none bg-white shadow-sm text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">
                        Semestre
                      </label>
                      <input
                        value={semestre}
                        onChange={(e) => setSemestre(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl outline-none bg-white shadow-sm text-center"
                        placeholder="2024-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">
                        Estado
                      </label>
                      <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border-none bg-white shadow-sm font-bold outline-none"
                      >
                        <option value="activo">Activo (Verde)</option>
                        <option value="inactivo">Inactivo (Gris)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">
                        Tiempo Examen (Minutos)
                      </label>
                      <input
                        type="number"
                        value={duracion}
                        onChange={(e) => setDuracion(Number(e.target.value))}
                        className="w-full px-4 py-2 rounded-xl bg-white shadow-sm font-bold outline-none text-center"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">
                        Fecha de Creación
                      </label>
                      <input
                        type="date"
                        value={createdAt}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 border-none font-bold text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">
                        Fecha Límite para completar
                      </label>
                      <input
                        type="datetime-local"
                        value={fechaLimite}
                        onChange={(e) => setFechaLimite(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-blue-500 rounded-xl font-bold bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* GESTIÓN DE SECCIONES (MODO ESPECIALIZADO) */}
                {tipo === "specialized" && (
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center border-b-2 border-purple-600 pb-2">
                      <h4 className="font-black text-purple-600 uppercase text-sm tracking-tighter">
                        GESTIÓN DE SECCIONES
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const n = {
                            id: Date.now().toString(),
                            titulo: `Sección ${secciones.length + 1}`,
                            videos: [],
                            pdfs: [],
                            questions: [],
                          };
                          setSecciones([...secciones, n]);
                          setActiveTab(secciones.length);
                        }}
                        className="bg-purple-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase"
                      >
                        + AÑADIR SECCIÓN
                      </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {secciones.map((sec, idx) => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => setActiveTab(idx)}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${activeTab === idx ? "border-purple-600 text-purple-600 bg-purple-50" : "border-gray-200 text-gray-400"}`}
                        >
                          {sec.titulo || `Sección ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* CONTENIDO MULTIMEDIA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* VIDEOS */}
                  <div className="space-y-4">
                    <h4 className="font-black text-blue-600 text-[11px] uppercase tracking-widest">
                      2. VIDEOS DEL CURSO
                    </h4>
                    {getContent("videos").map((v: any, i: number) => (
                      <div
                        key={v.id}
                        className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 relative space-y-2"
                      >
                        <input
                          value={v.title}
                          onChange={(e) => {
                            const list = [...getContent("videos")];
                            list[i].title = e.target.value;
                            updateContent("videos", list);
                          }}
                          placeholder="Título Video"
                          className="w-full bg-transparent font-bold text-sm outline-none"
                        />
                        <div className="flex gap-2 items-center">
                          <input
                            value={v.fileUrl}
                            // QUITAMOS EL readOnly para permitir pegar links
                            onChange={(e) => {
                              const list = [...getContent("videos")];
                              list[i].fileUrl = e.target.value;
                              updateContent("videos", list);
                            }}
                            placeholder="Pega un link (YouTube/Drive) o sube un archivo .mp4"
                            className="flex-1 bg-white px-2 py-1 rounded text-[10px] text-blue-500 border border-blue-100 focus:border-blue-500 outline-none"
                          />
                          <input
                            type="file"
                            id={`v-${i}`}
                            className="hidden"
                            accept="video/mp4" // Recomendado para Vercel Blob
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleFileUpload(i, "video", e.target.files[0])
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              document.getElementById(`v-${i}`)?.click()
                            }
                            className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-black uppercase"
                          >
                            SUBIR
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateContent(
                              "videos",
                              getContent("videos").filter(
                                (x: any) => x.id !== v.id,
                              ),
                            )
                          }
                          className="absolute top-2 right-2 text-red-300"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        updateContent("videos", [
                          ...getContent("videos"),
                          { id: Date.now().toString(), title: "", fileUrl: "" },
                        ])
                      }
                      className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline"
                    >
                      + AÑADIR VIDEO
                    </button>
                  </div>

                  {/* PDFS */}
                  <div className="space-y-4">
                    <h4 className="font-black text-red-600 text-[11px] uppercase tracking-widest">
                      3. DOCUMENTOS PDF
                    </h4>
                    {getContent("pdfs").map((p: any, i: number) => (
                      <div
                        key={p.id}
                        className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 relative space-y-2"
                      >
                        <input
                          value={p.title}
                          onChange={(e) => {
                            const list = [...getContent("pdfs")];
                            list[i].title = e.target.value;
                            updateContent("pdfs", list);
                          }}
                          placeholder="Título PDF"
                          className="w-full bg-transparent font-bold text-sm outline-none"
                        />
                        <div className="flex gap-2 items-center">
                          <input
                            value={p.fileUrl}
                            // QUITAMOS EL readOnly
                            onChange={(e) => {
                              const list = [...getContent("pdfs")];
                              list[i].fileUrl = e.target.value;
                              updateContent("pdfs", list);
                            }}
                            placeholder="Pega link de PDF externo o sube uno"
                            className="flex-1 bg-white px-2 py-1 rounded text-[10px] text-red-500 border border-red-100 focus:border-red-500 outline-none"
                          />
                          <input
                            type="file"
                            id={`p-${i}`}
                            className="hidden"
                            accept=".pdf"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleFileUpload(i, "pdf", e.target.files[0])
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              document.getElementById(`p-${i}`)?.click()
                            }
                            className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-black uppercase"
                          >
                            SUBIR
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateContent(
                              "pdfs",
                              getContent("pdfs").filter(
                                (x: any) => x.id !== p.id,
                              ),
                            )
                          }
                          className="absolute top-2 right-2 text-red-300"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        updateContent("pdfs", [
                          ...getContent("pdfs"),
                          { id: Date.now().toString(), title: "", fileUrl: "" },
                        ])
                      }
                      className="text-[10px] font-black text-red-600 uppercase tracking-tighter hover:underline"
                    >
                      + AÑADIR PDF
                    </button>
                  </div>
                </div>

                {/* 4. CONTENIDO DEL EXAMEN */}
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-gray-800 text-xl tracking-tighter uppercase">
                      4. CONTENIDO DEL EXAMEN
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        updateContent("questions", [
                          ...getContent("questions"),
                          {
                            id: Date.now().toString(),
                            type: "closed",
                            question: "",
                            options: [""],
                            answer: "",
                          },
                        ])
                      }
                      className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-black uppercase shadow-lg shadow-gray-200 hover:scale-105 transition-all"
                    >
                      + AÑADIR PREGUNTA
                    </button>
                  </div>
                  {getContent("questions").map((q: any, i: number) => (
                    <div
                      key={q.id}
                      className="p-6 border border-gray-100 rounded-3xl space-y-4 relative group bg-gray-50/20"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black px-3 py-1 bg-gray-100 rounded-full">
                          PREGUNTA #{i + 1}
                        </span>
                        <select
                          value={q.type}
                          onChange={(e) => {
                            const list = [...getContent("questions")];
                            list[i].type = e.target.value;
                            updateContent("questions", list);
                          }}
                          className="text-[10px] font-black bg-transparent text-blue-600 outline-none uppercase border-none"
                        >
                          <option value="closed">Selección Múltiple</option>
                          <option value="open">Abierta</option>
                        </select>
                      </div>
                      <input
                        value={q.question}
                        onChange={(e) => {
                          const list = [...getContent("questions")];
                          list[i].question = e.target.value;
                          updateContent("questions", list);
                        }}
                        className="w-full text-lg font-bold border-b-2 border-transparent focus:border-blue-500 bg-transparent outline-none"
                        placeholder="Enunciado de la pregunta"
                      />

                      {q.type === "closed" && (
                        <div className="space-y-3 pt-2">
                          {q.options.map((opt: string, oIdx: number) => (
                            <div key={oIdx} className="flex items-center gap-3">
                              <input
                                type="radio"
                                checked={q.answer === opt}
                                onChange={() => {
                                  const list = [...getContent("questions")];
                                  list[i].answer = opt;
                                  updateContent("questions", list);
                                }}
                                className="w-4 h-4 text-blue-600"
                              />
                              <input
                                value={opt}
                                onChange={(e) => {
                                  const list = [...getContent("questions")];
                                  const opts = [...list[i].options];
                                  opts[oIdx] = e.target.value;
                                  list[i].options = opts;
                                  updateContent("questions", list);
                                }}
                                className="flex-1 bg-white px-4 py-2 rounded-xl text-sm outline-none shadow-sm"
                                placeholder={`Opción ${oIdx + 1}`}
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...getContent("questions")];
                              list[i].options = [...list[i].options, ""];
                              updateContent("questions", list);
                            }}
                            className="text-[10px] font-black text-blue-600 underline"
                          >
                            + AÑADIR OPCIÓN
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          updateContent(
                            "questions",
                            getContent("questions").filter(
                              (x: any) => x.id !== q.id,
                            ),
                          )
                        }
                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-6 pt-10 border-t items-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-sm font-bold text-gray-400 hover:text-gray-600 uppercase"
                  >
                    DESCARTAR
                  </button>
                  <button
                    type="submit"
                    className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:scale-[1.02] transition-all uppercase text-[13px] tracking-widest"
                  >
                    GUARDAR CAMBIOS
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
