"use client";
import { usePosts } from "@/hooks/usePosts";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import CreatePost from "@/components/posts/CreatePost/CreatePost";
import PostCard from "@/components/posts/PostCard/PostCard";
import { Carousel } from "@/components/ui/Carousel/Carousel";
import api from "@/lib/api/axios";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  CheckCircle2,
  Lock as LockIcon,
} from "lucide-react";

import CourseFormModal from "@/components/CourseFormModal";
import CourseStudentsModal from "@/components/CourseStudentsModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

const carouselImages = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    alt: "Campus universitario",
    title: "Nuestro Campus",
    description: "Instalaciones modernas para una educación de excelencia",
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    alt: "Biblioteca universitaria",
    title: "Biblioteca Central",
    description: "Más de 50,000 libros disponibles para nuestros estudiantes",
  },
];

export default function Feed() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isRole, userRole } = usePermission();

  // Traemos 'isLoading' y 'refetch' del hook para controlar el estado en Vercel
  const {
    posts,
    addPost,
    likePost,
    commentOnPost,
    sharePost,
    voteOnPoll,
    isLoading,
    refetch,
  } = usePosts();

  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [cursos, setCursos] = useState<any[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);

  const loadCursos = async () => {
    if (!user?.id) return;
    try {
      const endpoint =
        userRole === "student"
          ? `${API_BASE}/courses/enrolled/${user.id}`
          : `${API_BASE}/courses`;
          console.log("Llamando a:", endpoint);
      const coursesRes = await fetch(endpoint);
      const rawData = await coursesRes.json();
      const todosLosCursos = Array.isArray(rawData)
        ? rawData
        : rawData.courses || rawData.data || [];

      const progressRes = await fetch(
        `${API_BASE}/courses/user-progress?userId=${user.id}`,
      );
      const progressData = await progressRes.json();
      const completadosIds = (
        Array.isArray(progressData) ? progressData : []
      ).map((id) => String(id));

      if (todosLosCursos.length > 0) {
        const dataFinal = todosLosCursos.map((c: any) => ({
          ...c,
          id: c.id,
          nombre: c.nombre || c.title || "Curso sin nombre",
          codigo: c.codigo || "S/C",
          profesor: c.profesor || "Staff Universidad",
          completado: completadosIds.includes(String(c.id)),
        }));
        setCursos(dataFinal);
      } else {
        setCursos([]);
      }
    } catch (e) {
      console.error("Error crítico en loadCursos:", e);
      setCursos([]);
    }
  };

  useEffect(() => {
    // En Vercel, forzamos la carga de datos cuando la auth esté lista
    if (isAuthenticated) {
      loadCursos();
      refetch(); // Asegura que los posts se pidan a Neon tras el refresh
    }

    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isAuthenticated, user?.id]);

  const esAdminOProfesor = userRole === "admin" || userRole === "teacher";

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const moveDistance = clientWidth * 0.5;
      const scrollTo =
        direction === "left"
          ? scrollLeft - moveDistance
          : scrollLeft + moveDistance;
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });
    }
  };

  const handleSaveCourse = async (updatedCourse: any) => {
    try {
      const response = await fetch(`${API_BASE}/courses/${updatedCourse.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaLimite: updatedCourse.fechaLimite }),
      });
      if (!response.ok) throw new Error("Error al actualizar curso");
      const result = await response.json();
      setCursos((prev) =>
        prev.map((c) => (c.id === updatedCourse.id ? { ...c, ...result } : c)),
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className={`${isMobile ? "p-3" : "max-w-7xl mx-auto p-4 lg:p-6"}`}>
        {!isMobile && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Feed Universitario
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenido, {user?.name || "Invitado"}.
            </p>
          </div>
        )}

        {isAuthenticated && cursos.length > 0 && (
          <div className="mb-10 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Cursos disponibles
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll("left")}
                  className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-100 shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-100 shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-5 pb-4 snap-x no-scrollbar"
              style={{ scrollbarWidth: "none" }}
            >
              {cursos.map((curso, index) => {
                const ahora = new Date();
                const fechaLimite = curso.fechaLimite
                  ? new Date(curso.fechaLimite)
                  : null;
                const estaVencido = fechaLimite ? ahora > fechaLimite : false;
                const estaHabilitado =
                  esAdminOProfesor ||
                  (!estaVencido &&
                    (index === 0 || !!cursos[index - 1].completado));

                return (
                  <div
                    key={curso.id}
                    className={`min-w-[300px] md:min-w-[320px] bg-white rounded-2xl border border-gray-100 shadow-sm p-6 snap-start transition-all ${!estaHabilitado ? "opacity-50 grayscale-[0.5]" : "hover:shadow-md"}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        {curso.codigo}
                      </span>
                      <div className="flex gap-2">
                        {esAdminOProfesor && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedCurso(curso);
                                setShowStudentsModal(true);
                              }}
                              className="text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Users size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCurso(curso);
                                setIsModalOpen(true);
                              }}
                              className="text-gray-400 hover:text-purple-500 transition-colors"
                            >
                              <BookOpen size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight h-12 line-clamp-2">
                      {curso.nombre}
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 text-sm flex items-center">
                        <Users size={16} className="mr-1.5" /> {curso.profesor}
                      </p>
                    </div>
                    <div className="text-[10px] flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${estaVencido ? "bg-red-400" : "bg-green-400"}`}
                      ></span>
                      <span className="text-gray-400 font-medium">
                        {estaVencido
                          ? "Desactivado"
                          : "Disponible hasta: " +
                            (fechaLimite?.toLocaleDateString() || "Sin límite")}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                      <button
                        onClick={() =>
                          estaHabilitado &&
                          router.push("/dashboard/gestion-cursos")
                        }
                        disabled={!estaHabilitado}
                        className={`flex items-center gap-2 font-bold text-sm ${estaHabilitado ? "text-purple-600" : "text-gray-400"}`}
                      >
                        {estaHabilitado ? (
                          <BookOpen size={20} />
                        ) : (
                          <LockIcon size={20} />
                        )}
                        <span>
                          {estaHabilitado ? "Ir al curso" : "Bloqueado"}
                        </span>
                      </button>
                      {curso.completado && (
                        <CheckCircle2
                          size={22}
                          className="text-green-500"
                          fill="currentColor"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          <div className="hidden lg:block lg:w-1/6">
            <div className="sticky top-6 bg-white rounded-xl shadow-lg overflow-hidden h-96">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Uni"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:w-3/5">
            {isAuthenticated &&
              user &&
              (isRole("admin") || isRole("teacher")) && (
                <CreatePost currentUser={user} onPostCreated={addPost} />
              )}
            <div className="space-y-6 mt-6">
              {/* Mostramos Skeleton o Loader si está cargando en Vercel */}
              {isLoading ? (
                <div className="text-center py-10 text-gray-400 animate-pulse">
                  Cargando publicaciones...
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={() => likePost(post.id)}
                      onComment={(postId, content) =>
                        commentOnPost(postId, content)
                      }
                      onShare={() => sharePost(post.id)}
                      onVote={(postId, idx) => voteOnPoll(postId, idx)}
                    />
                  ))}
                  {!isLoading && posts.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                      No hay publicaciones todavía.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-bold text-gray-800 mb-4">Galería</h3>
              <Carousel images={carouselImages} />
            </div>
          </div>
        </div>

        {isModalOpen && (
          <CourseFormModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCurso(null);
            }}
            courseData={selectedCurso}
            onSave={handleSaveCourse}
          />
        )}
        {showStudentsModal && (
          <CourseStudentsModal
            isOpen={showStudentsModal}
            onClose={() => setShowStudentsModal(false)}
            courseId={selectedCurso?.id}
          />
        )}
      </div>
    </div>
  );
}
