// src/components/Forms/InstructorForm.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const InstructorForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Nuevo Instructor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <Input placeholder="Ej. Dr. Carlos Mendoza" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
            <Input placeholder="Ej. Matemáticas Aplicadas" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" placeholder="correo@edu.pe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <Input placeholder="+51 900..." required />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1 bg-blue-600">Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// src/components/Forms/EstudianteForm.tsx
export const EstudianteForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Nuevo Estudiante</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Alumno</label>
            <Input placeholder="Ej. Juan Pérez" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de Matrícula</label>
            <Input placeholder="20241010" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Institucional</label>
            <Input type="email" placeholder="alumno@universidad.edu" required />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">Registrar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};