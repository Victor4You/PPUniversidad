// src/components/test/CourseTestModal.tsx
"use client";

import { Fragment, useState, useEffect, useCallback, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

// --- ICONOS ORIGINALES MANTENIDOS ---
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
const PlayIcon = () => (
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
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const DocumentIcon = () => (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
const ClockIcon = () => (
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
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const Star = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.05 9.401c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

export default function CourseTestModal({
  isOpen,
  onClose,
  onSuccess,
  courseData,
}: any) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<
    "content" | "quiz" | "survey" | "results"
  >("content");
  const [surveyData, setSurveyData] = useState<Record<string, number>>({
    ensenanza: 5,
    consistencia: 5,
    riesgo: 5,
    contenido: 5,
  });

  const lastTimeReached = useRef(0);
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [currentPDF, setCurrentPDF] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);
  const [quizTimeLeft, setQuizTimeLeft] = useState<number>(1800);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [pdfScrollReached, setPdfScrollReached] = useState(false);

  const [viewedVideos, setViewedVideos] = useState<Set<string>>(new Set());
  const [viewedPdfs, setViewedPdfs] = useState<Set<string>>(new Set());

  const tieneSecciones =
    courseData?.secciones && courseData.secciones.length > 0;

  // 1. CARGA DE PROGRESO CORREGIDA (@Get('user-progress'))
  useEffect(() => {
    const fetchProgress = async () => {
      if (isOpen && user?.id && courseData?.id) {
        try {
          const { data } = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/courses/user-progress`,
            {
              params: {
                userId: Number(user.id),
                courseId: Number(courseData.id),
              },
            },
          );
          if (data) {
            setViewedVideos(new Set(data.viewedVideos?.map(String) || []));
            setViewedPdfs(new Set(data.viewedPdfs?.map(String) || []));
            setAttempts(data.attempts || 0);
          }
        } catch (error) {
          console.log("Iniciando curso nuevo o sin progreso previo.");
        }
      }
    };

    if (isOpen) {
      fetchProgress();
      setShuffledQuestions(
        [...(courseData?.questions || [])].sort(() => Math.random() - 0.5),
      );
      setQuizTimeLeft((courseData?.duracionExamen || 30) * 60);
      setCurrentStep("content");
    }
  }, [isOpen, user?.id, courseData]);

  // 2. SINCRONIZACIÓN CORREGIDA (@Post('save-progress'))
  const syncProgress = async (
    updatedVideos: Set<string>,
    updatedPdfs: Set<string>,
    updatedAttempts: number,
  ) => {
    const userId = user?.id ? Number(user.id) : null;
    const courseId = courseData?.id ? Number(courseData.id) : null;

    if (!userId || !courseId) return;

    const payload = {
      userId: Number(user?.id), // Aseguramos que sea el ID 4 de Isaac (Número)
      courseId: Number(courseData.id), // ID del curso (Número)
      score: score, // El puntaje obtenido (ej. 100)
      survey: surveyData, // El objeto de la encuesta de satisfacción
      xpEarned: score >= 90 ? 100 : 0, // Los puntos ganados
      // Opcionales si tu backend los usa para historial:
      viewedVideos: Array.from(viewedVideos).map(Number),
      viewedPdfs: Array.from(viewedPdfs).map(Number),
      attempts: attempts,
    };

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/save-progress`,
        payload,
      );
      console.log("✅ Progreso sincronizado");
    } catch (e: any) {
      console.error(
        "❌ Error de sincronización:",
        e.response?.data || e.message,
      );
    }
  };

  // --- LÓGICA DE BLOQUEO ---
  const isSectionLocked = (sectionIndex: number) => {
    if (sectionIndex === 0) return false;
    const prevSection = courseData.secciones[sectionIndex - 1];
    const vListos = (prevSection.videos || []).every((v: any) =>
      viewedVideos.has(String(v.id)),
    );
    const pListos = (prevSection.pdfs || []).every((p: any) =>
      viewedPdfs.has(String(p.id)),
    );
    return !(vListos && pListos);
  };

  const totalItems = tieneSecciones
    ? courseData.secciones.reduce(
        (acc: number, s: any) =>
          acc + (s.videos?.length || 0) + (s.pdfs?.length || 0),
        0,
      )
    : (courseData?.videos?.length || 0) + (courseData?.pdfs?.length || 0);

  const isExamUnlocked =
    viewedVideos.size + viewedPdfs.size >= totalItems && totalItems > 0;

  const handleFinishExam = useCallback(async () => {
    let correctas = 0;
    shuffledQuestions.forEach((q: any) => {
      if (userAnswers[q.id] === q.answer) correctas++;
    });
    const finalScore = Math.round((correctas / shuffledQuestions.length) * 100);
    setScore(finalScore);

    if (finalScore >= 90) {
      setCurrentStep("survey");
    } else {
      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      if (nextAttempt >= 2) {
        alert("Segundo intento fallido. El progreso se reiniciará.");
        const clear = new Set<string>();
        setViewedVideos(clear);
        setViewedPdfs(clear);
        setAttempts(0);
        await syncProgress(clear, clear, 0);
        setCurrentStep("content");
      } else {
        await syncProgress(viewedVideos, viewedPdfs, nextAttempt);
        setCurrentStep("results");
      }
    }
  }, [
    shuffledQuestions,
    userAnswers,
    attempts,
    viewedVideos,
    viewedPdfs,
    user,
    courseData,
  ]);

  const handleSaveToPostgres = async () => {
    try {
      const xpGanada = 100;
      const bonoPerfecto = score === 100 ? 50 : 0;
      const totalXP = xpGanada + bonoPerfecto;

      const payload = {
        courseId: Number(courseData.id),
        userId: Number(user?.id),
        score: score,
        survey: surveyData,
        xpEarned: totalXP,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/register-completion`,
        payload,
      );

      // ✅ IMPORTANTE: Notificamos al padre (page.tsx) pasándole el ID del curso
      // para que sepa qué curso marcar como completado en la UI
      if (onSuccess) onSuccess(courseData.id);

      alert(`¡Felicidades! Has ganado ${totalXP} XP 🏆`);

      // Saltamos al paso de resultados
      setCurrentStep("results");
      
    } catch (error: any) {
      console.error(
        "Error al guardar resultados:",
        error.response?.data || error,
      );
      alert(
        "Error al guardar resultados: " +
          (error.response?.data?.message || "Error de red"),
      );
    }
  };
  const descargarDiploma = () => {
  // Nota: Usamos la URL de tu backend local (puerto 3014)
  const url = `http://localhost:3014/courses/download-diploma?userId=${user.id}&courseId=${courseData.id}`;
  
  // En Electron/Nextjs, esto abrirá el diálogo de descarga del sistema
  window.open(url, '_blank');
};

  const markPDFAsRead = () => {
    if (currentPDF && pdfScrollReached) {
      const newPdfs = new Set(viewedPdfs).add(String(currentPDF.id));
      setViewedPdfs(newPdfs);
      syncProgress(viewedVideos, newPdfs, attempts);
      setCurrentPDF(null);
      setPdfScrollReached(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStep === "quiz" && quizTimeLeft > 0) {
      timer = setInterval(() => {
        setQuizTimeLeft((prev) =>
          prev <= 1 ? (handleFinishExam(), 0) : prev - 1,
        );
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, quizTimeLeft, handleFinishExam]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl max-h-[90vh] transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b pb-4 flex-shrink-0">
                  <div>
                    <Dialog.Title className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                      {courseData?.nombre}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
                      Material de estudio y evaluación
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon />
                  </button>
                </div>

                <div className="flex space-x-4 mb-8 flex-shrink-0">
                  <button
                    onClick={() => setCurrentStep("content")}
                    className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${currentStep === "content" ? "bg-black text-white shadow-lg" : "bg-gray-100 text-gray-400"}`}
                  >
                    CONTENIDO
                  </button>
                  <button
                    onClick={() => isExamUnlocked && setCurrentStep("quiz")}
                    disabled={!isExamUnlocked}
                    className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${currentStep === "quiz" ? "bg-green-600 text-white shadow-lg" : isExamUnlocked ? "bg-gray-100 text-black" : "bg-gray-50 text-gray-300 cursor-not-allowed"}`}
                  >
                    CUESTIONARIO {!isExamUnlocked ? "🔒" : "✅"}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                  {currentStep === "content" && (
                    <div className="space-y-8 pb-4">
                      {tieneSecciones ? (
                        courseData.secciones.map(
                          (seccion: any, sIdx: number) => {
                            const locked = isSectionLocked(sIdx);
                            return (
                              <div
                                key={sIdx}
                                className={`bg-white border-2 rounded-[2rem] p-6 shadow-sm transition-all ${locked ? "opacity-50 grayscale bg-gray-50 border-gray-100" : "border-gray-100"}`}
                              >
                                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                                  <span
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${locked ? "bg-gray-400 text-white" : "bg-blue-600 text-white"}`}
                                  >
                                    {locked ? "🔒" : sIdx + 1}
                                  </span>
                                  {seccion.titulo}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {seccion.videos?.map((video: any) => (
                                    <button
                                      key={video.id}
                                      disabled={locked}
                                      onClick={() => {
                                        setCurrentVideo(video);
                                        lastTimeReached.current = 0;
                                      }}
                                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${viewedVideos.has(String(video.id)) ? "bg-green-50 border-green-200" : "bg-gray-50 border-transparent hover:border-blue-200"}`}
                                    >
                                      <div
                                        className={`p-2 rounded-lg ${viewedVideos.has(String(video.id)) ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
                                      >
                                        <PlayIcon />
                                      </div>
                                      <span className="font-bold text-sm truncate">
                                        {video.title}
                                      </span>
                                      {viewedVideos.has(String(video.id)) && (
                                        <span className="ml-auto text-[10px] font-black text-green-600 uppercase">
                                          Visto
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                  {seccion.pdfs?.map((pdf: any) => (
                                    <button
                                      key={pdf.id}
                                      disabled={locked}
                                      onClick={() => {
                                        setCurrentPDF(pdf);
                                        setPdfScrollReached(false);
                                      }}
                                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${viewedPdfs.has(String(pdf.id)) ? "bg-green-50 border-green-200" : "bg-gray-50 border-transparent hover:border-red-200"}`}
                                    >
                                      <div
                                        className={`p-2 rounded-lg ${viewedPdfs.has(String(pdf.id)) ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                                      >
                                        <DocumentIcon />
                                      </div>
                                      <span className="font-bold text-sm truncate">
                                        {pdf.title}
                                      </span>
                                      {viewedPdfs.has(String(pdf.id)) && (
                                        <span className="ml-auto text-[10px] font-black text-green-600 uppercase">
                                          Leído
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          },
                        )
                      ) : (
                        /* RENDERIZADO PARA CURSOS ESTÁNDAR (SIN SECCIONES) */
                        <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-6 shadow-sm">
                          <h3 className="text-sm font-black text-purple-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                              ★
                            </span>
                            Contenido General
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courseData?.videos?.map((video: any) => (
                              <button
                                key={video.id}
                                onClick={() => {
                                  setCurrentVideo(video);
                                  lastTimeReached.current = 0;
                                }}
                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${viewedVideos.has(String(video.id)) ? "bg-green-50 border-green-200" : "bg-gray-50 border-transparent hover:border-blue-200"}`}
                              >
                                <div
                                  className={`p-2 rounded-lg ${viewedVideos.has(String(video.id)) ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
                                >
                                  <PlayIcon />
                                </div>
                                <span className="font-bold text-sm truncate">
                                  {video.title}
                                </span>
                                {viewedVideos.has(String(video.id)) && (
                                  <span className="ml-auto text-[10px] font-black text-green-600 uppercase">
                                    Visto
                                  </span>
                                )}
                              </button>
                            ))}
                            {courseData?.pdfs?.map((pdf: any) => (
                              <button
                                key={pdf.id}
                                onClick={() => {
                                  setCurrentPDF(pdf);
                                  setPdfScrollReached(false);
                                }}
                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${viewedPdfs.has(String(pdf.id)) ? "bg-green-50 border-green-200" : "bg-gray-50 border-transparent hover:border-red-200"}`}
                              >
                                <div
                                  className={`p-2 rounded-lg ${viewedPdfs.has(String(pdf.id)) ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                                >
                                  <DocumentIcon />
                                </div>
                                <span className="font-bold text-sm truncate">
                                  {pdf.title}
                                </span>
                                {viewedPdfs.has(String(pdf.id)) && (
                                  <span className="ml-auto text-[10px] font-black text-green-600 uppercase">
                                    Leído
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === "quiz" && (
                    <div className="space-y-8 pb-6">
                      <div className="flex justify-between items-center p-6 bg-black text-white rounded-3xl sticky top-0 z-10 shadow-lg">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-400 uppercase">
                            Intento
                          </span>
                          <span className="text-xl font-black">
                            {attempts + 1} / 2
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ClockIcon />
                          <span className="text-2xl font-black">
                            {formatTime(quizTimeLeft)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-gray-400 uppercase">
                            Mínimo
                          </span>
                          <span className="text-xl font-black text-green-500">
                            90%
                          </span>
                        </div>
                      </div>
                      {shuffledQuestions.map((q: any, i: number) => (
                        <div
                          key={q.id}
                          className="p-8 border-2 border-gray-100 rounded-[2rem] bg-gray-50 space-y-6"
                        >
                          <p className="text-xl font-black text-gray-800 italic">
                            {i + 1}. {q.question}
                          </p>
                          <div className="grid grid-cols-1 gap-4">
                            {q.options?.map((opt: string, idx: number) => (
                              <label
                                key={idx}
                                className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${userAnswers[q.id] === opt ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-white border-transparent hover:border-gray-200 text-gray-700"}`}
                              >
                                <input
                                  type="radio"
                                  className="hidden"
                                  checked={userAnswers[q.id] === opt}
                                  onChange={() =>
                                    setUserAnswers((prev) => ({
                                      ...prev,
                                      [q.id]: opt,
                                    }))
                                  }
                                />
                                <span className="font-bold">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={handleFinishExam}
                        className="w-full py-6 bg-green-600 text-white rounded-[2rem] font-black text-xl shadow-xl"
                      >
                        ENVIAR PARA CALIFICACIÓN
                      </button>
                    </div>
                  )}

                  {currentStep === "survey" && (
                    <div className="space-y-8 py-6">
                      <h3 className="text-2xl font-black text-center uppercase text-black">
                        Encuesta de Calidad
                      </h3>
                      {["ensenanza", "consistencia", "riesgo", "contenido"].map(
                        (item) => (
                          <div
                            key={item}
                            className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl"
                          >
                            <span className="font-bold uppercase text-xs text-gray-600">
                              {item}
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((starValue) => (
                                <button
                                  key={starValue}
                                  onClick={() =>
                                    setSurveyData({
                                      ...surveyData,
                                      [item]: starValue,
                                    })
                                  }
                                >
                                  <Star
                                    className={`w-6 h-6 ${surveyData[item] >= starValue ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                      <button
                        onClick={handleSaveToPostgres}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase shadow-lg"
                      >
                        GUARDAR Y FINALIZAR
                      </button>
                    </div>
                  )}

                  {currentStep === "results" && (
                    <div className="text-center py-10 space-y-8">
                      <div
                        className={`text-[8rem] font-black tracking-tighter leading-none ${score >= 90 ? "text-green-600" : "text-red-600"}`}
                      >
                        {score}%
                      </div>
                      <p className="text-2xl font-black uppercase italic">
                        {score >= 90 ? "¡Aprobado!" : "Aprobación Fallida"}
                      </p>
                      <div className="flex gap-4 justify-center">
                        {score < 90 && (
                          <button
                            onClick={() => {
                              setScore(0);
                              setUserAnswers({});
                              setCurrentStep("quiz");
                              setQuizTimeLeft(
                                (courseData?.duracionExamen || 30) * 60,
                              );
                            }}
                            className="px-10 py-4 bg-black text-white rounded-2xl font-black hover:scale-105 transition-all"
                          >
                            REINTENTAR
                          </button>
                        )}
                        <button
                          onClick={onClose}
                          className={`px-10 py-4 rounded-2xl font-black ${score >= 90 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}
                        >
                          CERRAR
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* OVERLAYS VIDEO/PDF */}
                {currentVideo && (
                  <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-8">
                    <div className="w-full max-w-5xl aspect-video relative">
                      <button
                        onClick={() => setCurrentVideo(null)}
                        className="absolute -top-12 right-0 text-white flex items-center gap-2 font-black text-xs uppercase"
                      >
                        <XMarkIcon /> CERRAR VIDEO
                      </button>
                      {currentVideo.fileUrl.includes("youtube.com") ||
                      currentVideo.fileUrl.includes("youtu.be") ? (
                        <iframe
                          className="w-full h-full rounded-3xl"
                          src={currentVideo.fileUrl.replace(
                            "watch?v=",
                            "embed/",
                          )}
                          allowFullScreen
                        />
                      ) : (
                        <video
                          controls
                          autoPlay
                          className="w-full h-full rounded-3xl bg-black shadow-2xl"
                          onTimeUpdate={(e: any) => {
                            const v = e.target;
                            if (v.currentTime > lastTimeReached.current + 1.5) {
                              v.currentTime = lastTimeReached.current;
                            } else {
                              lastTimeReached.current = v.currentTime;
                            }
                          }}
                          onEnded={() => {
                            const updatedV = new Set(viewedVideos).add(
                              String(currentVideo.id),
                            );
                            setViewedVideos(updatedV);
                            syncProgress(updatedV, viewedPdfs, attempts);
                          }}
                        >
                          <source src={currentVideo.fileUrl} type="video/mp4" />
                        </video>
                      )}
                    </div>
                  </div>
                )}

                {currentPDF && (
                  <div className="fixed inset-0 bg-black/95 z-[80] flex items-center justify-center p-2 md:p-6">
                    <div className="w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">
                      <div className="flex justify-between items-center mb-3 text-white px-2">
                        <h3 className="font-black uppercase tracking-widest truncate max-w-[70%] text-xs">
                          {currentPDF.title}
                        </h3>
                        <button
                          onClick={() => {
                            setCurrentPDF(null);
                            setPdfScrollReached(false);
                          }}
                          className="flex items-center gap-2 font-black text-xs uppercase hover:text-red-500 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" /> CERRAR LECTURA
                        </button>
                      </div>
                      <div className="flex-1 w-full bg-[#525659] rounded-xl overflow-hidden relative shadow-2xl">
                        <iframe
                          src={`${currentPDF.fileUrl}#toolbar=0&navpanes=0`}
                          className="w-full h-full border-none"
                        />
                        <div
                          onMouseEnter={() => setPdfScrollReached(true)}
                          className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-auto"
                        />
                      </div>
                      <div className="mt-4 flex flex-col items-center gap-2">
                        <button
                          disabled={!pdfScrollReached}
                          onClick={markPDFAsRead}
                          className={`w-full py-4 rounded-2xl font-black uppercase transition-all duration-300 ${pdfScrollReached ? "bg-green-600 text-white shadow-lg scale-[1.02]" : "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5"}`}
                        >
                          {pdfScrollReached
                            ? "CONFIRMAR LECTURA COMPLETADA"
                            : "LECTURA EN PROGRESO..."}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
