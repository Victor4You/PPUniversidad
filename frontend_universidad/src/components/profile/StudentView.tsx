import { UserProfile } from "@/lib/types/user.types";
import { Avatar } from "@/components/ui/Avatar/Avatar";

export default function StudentView({ user }: { user: UserProfile }) {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Header Responsivo */}
      <div className="bg-white rounded-3xl p-6 shadow-soft flex flex-col md:flex-row items-center gap-6 mb-8">
        <Avatar src={user.avatar} alt={user.name} size="lg" className="w-24 h-24 md:w-32 md:h-32" />
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">{user.name}</h1>
          <p className="text-primary-600 font-medium capitalize">{user.role}</p>
          <p className="text-secondary-400 text-sm">{user.email}</p>
        </div>
      </div>

      {/* Grid de Contenido: 1 col en móvil, 3 en escritorio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Académica */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-100">
            <h3 className="font-bold text-secondary-800 mb-4 text-lg">Información</h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-secondary-400">Departamento:</span> {user.department || 'No asignado'}</p>
              <p><span className="text-secondary-400">Ingreso:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Cursos/Actividad - Ocupa más espacio en desktop */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-100 min-h-[300px]">
            <h3 className="font-bold text-secondary-800 mb-4 text-lg">Mis Materias</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ejemplo de tarjeta de materia */}
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                <p className="font-bold text-primary-700">Matemáticas Avanzadas</p>
                <p className="text-xs text-primary-500">Promedio: 9.5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}