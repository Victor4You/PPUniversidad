import { FormContainer } from "./GenericForm";
import { Input } from "@/components/ui/input";
// src/components/Forms/EstudianteForm.tsx
export const EstudianteForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <FormContainer title="Nuevo Estudiante" onClose={onClose} onSubmit={(e) => { e.preventDefault(); onClose(); }}>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700">Nombre del Estudiante</label>
          <Input placeholder="Ej. Juan Pérez" required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Matrícula / ID</label>
          <Input placeholder="20240001" required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Correo Institucional</label>
          <Input type="email" placeholder="estudiante@universidad.edu" required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Teléfono de Contacto</label>
          <Input placeholder="+51 9XX XXX XXX" />
        </div>
      </div>
    </FormContainer>
  );
};