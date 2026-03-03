import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Lock, BookOpen, CheckCircle2, Users } from "lucide-react";

interface CourseCardProps {
  title: string;
  instructor: string;
  image: string;
  // Nuevas props para conectar con la lógica del backend
  estudiantes?: number;
  estaHabilitado?: boolean;
  completado?: boolean;
  onClick?: () => void;
}

export const CourseCard = ({ 
  title, 
  instructor, 
  image, 
  estudiantes = 0, 
  estaHabilitado = true, 
  completado = false,
  onClick 
}: CourseCardProps) => {
  return (
    <Card 
      onClick={estaHabilitado ? onClick : undefined}
      className={`overflow-hidden transition-all duration-300 ${
        estaHabilitado 
          ? "hover:shadow-lg cursor-pointer border-gray-200" 
          : "opacity-60 grayscale-[0.5] cursor-not-allowed border-gray-100"
      }`}
    >
      <div className="relative h-40 w-full">
        <Image 
          src={image} 
          alt={title} 
          fill 
          className="object-cover"
        />
        {/* Overlay de bloqueo si no está habilitado */}
        {!estaHabilitado && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white/90 p-2 rounded-full shadow-sm">
              <Lock size={20} className="text-gray-600" />
            </div>
          </div>
        )}
        {/* Check de completado */}
        {completado && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-md">
            <CheckCircle2 size={16} fill="currentColor" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-sm line-clamp-2 mb-1 text-gray-900">{title}</h3>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500 flex items-center">
            {instructor}
          </p>
          <div className="flex items-center text-[10px] font-medium text-gray-400">
            <Users size={12} className="mr-1" />
            {estudiantes} {estudiantes === 1 ? 'inscrito' : 'inscritos'}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            estaHabilitado ? "text-purple-600" : "text-gray-400"
          }`}>
            {estaHabilitado ? "Disponible" : "Bloqueado"}
          </span>
          {estaHabilitado ? (
            <BookOpen size={16} className="text-purple-500" />
          ) : (
            <Lock size={16} className="text-gray-400" />
          )}
        </div>
      </div>
    </Card>
  );
};