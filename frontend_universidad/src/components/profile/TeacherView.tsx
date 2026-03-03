import { UserProfile } from "@/lib/types/user.types";
import { Avatar } from "@/components/ui/Avatar/Avatar";

export default function TeacherView({ user }: { user: UserProfile }) {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Cabecera con perfil del Profesor */}
      <div className="bg-gray-800 rounded-3xl p-6 md:p-10 shadow-xl border border-gray-700 flex flex-col md:flex-row items-center gap-8 mb-8 text-white">
        <Avatar 
          src={user.avatar} 
          alt={user.name} 
          className="w-28 h-28 md:w-40 md:h-40 border-4 border-blue-500 shadow-lg" 
        />
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h1 className="text-3xl md:text-4xl font-extrabold">{user.name}</h1>
            <span className="bg-blue-600 text-[10px] uppercase px-3 py-1 rounded-full w-fit mx-auto md:mx-0">
              Profesor Titular
            </span>
          </div>
          <p className="text-gray-400 text-lg mb-4">{user.email}</p>
          <div className="grid grid-cols-2 md:flex gap-4">
            <div className="bg-gray-700/50 p-3 rounded-2xl text-center md:px-6">
              <p className="text-blue-400 font-bold text-xl">12</p>
              <p className="text-xs text-gray-400 uppercase">Grupos</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-2xl text-center md:px-6">
              <p className="text-emerald-400 font-bold text-xl">320</p>
              <p className="text-xs text-gray-400 uppercase">Alumnos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal: 1 col móvil, 3 cols desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Información y Horario (1/3) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
              Detalles Académicos
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-400">Departamento:</span>
                <span className="font-semibold text-gray-700">{user.department || 'Ciencias Exactas'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-400">Especialidad:</span>
                <span className="font-semibold text-gray-700">Ingeniería de Software</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Antigüedad:</span>
                <span className="font-semibold text-gray-700">4 años</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Cursos Activos (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Cursos Asignados</h3>
              <button className="text-blue-600 text-sm font-semibold hover:underline">Ver todos</button>
            </div>
            
            {/* Lista de cursos responsiva */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Desarrollo Web Fullstack', students: 45, color: 'bg-purple-100 text-purple-700' },
                { name: 'Base de Datos II', students: 38, color: 'bg-blue-100 text-blue-700' },
                { name: 'Arquitectura de Software', students: 25, color: 'bg-emerald-100 text-emerald-700' },
                { name: 'Metodologías Ágiles', students: 42, color: 'bg-orange-100 text-orange-700' }
              ].map((course, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border border-transparent hover:border-gray-200 transition-all cursor-pointer shadow-sm ${course.color.split(' ')[0]}`}>
                  <h4 className="font-bold mb-1">{course.name}</h4>
                  <div className="flex items-center text-xs opacity-80">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                    {course.students} Alumnos inscritos
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}