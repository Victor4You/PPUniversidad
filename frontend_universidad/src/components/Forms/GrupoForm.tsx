// src/components/Forms/GrupoForm.tsx
import { Input } from "@/components/ui/input";
import { FormContainer } from "./GenericForm";

export const GrupoForm = ({ onClose }: { onClose: () => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría tu lógica de setGrupos(...)
    onClose();
  };

  return (
    <FormContainer title="Nuevo Grupo" onClose={onClose} onSubmit={handleSubmit}>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700">Nombre del Grupo</label>
          <Input placeholder="Ej. Grupo A - Matemáticas" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Código</label>
            <Input placeholder="GRP-001" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Capacidad</label>
            <Input type="number" placeholder="30" required />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Curso</label>
          <Input placeholder="Seleccionar curso..." required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Horario</label>
          <Input placeholder="Lun/Mié/Vie 08:00 - 10:00" required />
        </div>
      </div>
    </FormContainer>
  );
};