// types/form.ts
export interface Question {
  id: string;
  type: "cerrada" | "abierta";
  question: string;
  options?: string[];
  correctAnswer?: string;
}

export interface VideoResource {
  id: string;
  title: string;
  url: string;
  checked: boolean;
}

export interface PDFResource {
  id: string;
  title: string;
  url: string;
  checked: boolean;
}

export interface Period {
  startDate: string;
  endDate: string;
}

export interface CourseFormData {
  category: string;
  title: string;
  description: string;
  quizDuration: number;
  periods: Period[];
  bannerText: string;
  videos: VideoResource[];
  pdfs: PDFResource[];
  questions: Question[];
}

export interface InstructorFormData {
  nombre: string;
  especialidad: string;
  email: string;
  telefono: string;
  experiencia: number;
}

export interface GrupoFormData {
  nombre: string;
  curso: string;
  codigo: string;
  instructor: string;
  capacidad: number;
  horario: string;
  aula: string;
}

export interface EstudianteFormData {
  nombre: string;
  matricula: string;
  email: string;
  telefono: string;
}
export interface Section {
  id: string;
  titulo: string;
  videos: VideoResource[];
  pdfs: PDFResource[];
  questions: Question[];
}

export interface Curso {
  id?: number;
  nombre: string;
  codigo: string;
  profesor: string;
  creditos: number;
  semestre: string;
  estado: string;
  tipo: "general" | "specialized";
  duracionExamen: number; // Mantenemos el nombre exacto de tu Postgres
  fechaLimite: string;
  videos: VideoResource[];
  pdfs: PDFResource[];
  questions: Question[];
  secciones?: Section[]; // Añadido para la lógica del modal de secciones
  createdAt?: string;
  updatedAt?: string;
}
